from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from server.database import get_db
from server.models.models import User, Order, OrderItem, OrderStatus, MenuItem, Restaurant, Review
from server.routers.auth import get_current_user
import random, string

router = APIRouter(prefix="/api/orders", tags=["orders"])

def generate_order_number():
    return "ORD" + "".join(random.choices(string.digits, k=8))

class OrderItemRequest(BaseModel):
    menu_item_id: int
    quantity: int = 1
    selected_options: list = []

class CreateOrderRequest(BaseModel):
    restaurant_id: int
    items: list[OrderItemRequest]
    delivery_address: str
    delivery_lat: Optional[float] = None
    delivery_lng: Optional[float] = None
    notes: str = ""
    payment_method: str = "cash"

@router.post("")
def create_order(req: CreateOrderRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "customer":
        raise HTTPException(status_code=403, detail="Only customers can place orders")
    restaurant = db.query(Restaurant).filter(Restaurant.id == req.restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    subtotal = 0.0
    order_items = []
    for item_req in req.items:
        menu_item = db.query(MenuItem).filter(MenuItem.id == item_req.menu_item_id).first()
        if not menu_item:
            raise HTTPException(status_code=404, detail=f"Menu item {item_req.menu_item_id} not found")
        item_total = menu_item.price * item_req.quantity
        subtotal += item_total
        order_items.append(OrderItem(
            menu_item_id=menu_item.id, item_name=menu_item.name,
            quantity=item_req.quantity, unit_price=menu_item.price,
            total_price=item_total, selected_options=item_req.selected_options
        ))
    total = subtotal + restaurant.delivery_fee
    order = Order(
        order_number=generate_order_number(), user_id=current_user.id,
        restaurant_id=req.restaurant_id, status=OrderStatus.PENDING.value,
        subtotal=subtotal, delivery_fee=restaurant.delivery_fee, total=total,
        delivery_address=req.delivery_address, delivery_lat=req.delivery_lat,
        delivery_lng=req.delivery_lng, notes=req.notes, payment_method=req.payment_method
    )
    db.add(order)
    db.flush()
    for oi in order_items:
        oi.order_id = order.id
        db.add(oi)
    db.commit()
    db.refresh(order)
    return {"id": order.id, "order_number": order.order_number, "status": order.status, "total": order.total}

@router.get("")
def list_orders(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == "customer":
        orders = db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).all()
    elif current_user.role == "rider":
        orders = db.query(Order).filter(Order.rider_id == current_user.id).order_by(Order.created_at.desc()).all()
    else:
        orders = db.query(Order).order_by(Order.created_at.desc()).all()
    result = []
    for o in orders:
        items = [{"id": i.id, "item_name": i.item_name, "quantity": i.quantity, "unit_price": i.unit_price, "total_price": i.total_price} for i in o.items]
        result.append({
            "id": o.id, "order_number": o.order_number, "status": o.status,
            "subtotal": o.subtotal, "delivery_fee": o.delivery_fee, "total": o.total,
            "delivery_address": o.delivery_address, "notes": o.notes,
            "payment_method": o.payment_method, "created_at": str(o.created_at),
            "restaurant_name": o.restaurant.name if o.restaurant else "",
            "rider_name": o.rider.name if o.rider else None,
            "items": items
        })
    return result

@router.get("/{order_id}")
def get_order(order_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    o = db.query(Order).options(joinedload(Order.items), joinedload(Order.restaurant), joinedload(Order.rider)).filter(Order.id == order_id).first()
    if not o:
        raise HTTPException(status_code=404, detail="Order not found")
    if current_user.role == "customer" and o.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your order")
    return {
        "id": o.id, "order_number": o.order_number, "status": o.status,
        "subtotal": o.subtotal, "delivery_fee": o.delivery_fee, "total": o.total,
        "delivery_address": o.delivery_address, "notes": o.notes,
        "payment_method": o.payment_method, "created_at": str(o.created_at),
        "restaurant_name": o.restaurant.name if o.restaurant else "",
        "rider_name": o.rider.name if o.rider else None,
        "items": [{"id": i.id, "item_name": i.item_name, "quantity": i.quantity, "unit_price": i.unit_price, "total_price": i.total_price, "selected_options": i.selected_options} for i in o.items]
    }

@router.put("/{order_id}/cancel")
def cancel_order(order_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    o = db.query(Order).filter(Order.id == order_id).first()
    if not o:
        raise HTTPException(status_code=404, detail="Order not found")
    if o.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your order")
    if o.status not in [OrderStatus.PENDING.value, OrderStatus.ACCEPTED.value]:
        raise HTTPException(status_code=400, detail="Order cannot be cancelled")
    o.status = OrderStatus.CANCELLED.value
    db.commit()
    return {"message": "Order cancelled", "status": o.status}

@router.put("/{order_id}/rate")
def rate_order(order_id: int, rating: int, comment: str = "", current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    o = db.query(Order).filter(Order.id == order_id).first()
    if not o or o.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Order not found")
    if o.status != OrderStatus.DELIVERED.value:
        raise HTTPException(status_code=400, detail="Order not yet delivered")
    existing = db.query(Review).filter(Review.order_id == order_id, Review.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already reviewed")
    review = Review(user_id=current_user.id, order_id=order_id, restaurant_id=o.restaurant_id, rating=rating, comment=comment)
    db.add(review)
    db.commit()
    return {"message": "Review submitted"}
