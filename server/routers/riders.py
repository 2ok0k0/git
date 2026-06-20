from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from server.database import get_db
from server.models.models import User, Order, OrderStatus, DeliveryRecord
from server.routers.auth import get_current_user
from datetime import datetime

router = APIRouter(prefix="/api/riders", tags=["riders"])

@router.get("/available-orders")
def get_available_orders(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "rider":
        raise HTTPException(status_code=403, detail="Rider access required")
    orders = db.query(Order).options(joinedload(Order.restaurant), joinedload(Order.items)).filter(Order.status == OrderStatus.PENDING.value).order_by(Order.created_at.desc()).all()
    return [{"id": o.id, "order_number": o.order_number, "restaurant_name": o.restaurant.name,
             "delivery_address": o.delivery_address, "subtotal": o.subtotal, "total": o.total,
             "created_at": str(o.created_at), "item_count": len(o.items)} for o in orders]

@router.put("/orders/{order_id}/accept")
def accept_order(order_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "rider":
        raise HTTPException(status_code=403, detail="Rider access required")
    o = db.query(Order).filter(Order.id == order_id, Order.status == OrderStatus.PENDING.value).first()
    if not o:
        raise HTTPException(status_code=404, detail="Order not available")
    o.status = OrderStatus.ACCEPTED.value
    o.rider_id = current_user.id
    record = DeliveryRecord(order_id=order_id, rider_id=current_user.id, status="accepted")
    db.add(record)
    db.commit()
    return {"message": "Order accepted", "order_id": order.id}

@router.put("/orders/{order_id}/pickup")
def pickup_order(order_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "rider":
        raise HTTPException(status_code=403, detail="Rider access required")
    o = db.query(Order).filter(Order.id == order_id, Order.rider_id == current_user.id, Order.status == OrderStatus.ACCEPTED.value).first()
    if not o:
        raise HTTPException(status_code=404, detail="Order not found")
    o.status = OrderStatus.OUT_FOR_DELIVERY.value
    record = db.query(DeliveryRecord).filter(DeliveryRecord.order_id == order_id, DeliveryRecord.rider_id == current_user.id).first()
    if record:
        record.status = "picked_up"
        record.pickup_time = datetime.utcnow()
    db.commit()
    return {"message": "Order picked up"}

@router.put("/orders/{order_id}/deliver")
def deliver_order(order_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "rider":
        raise HTTPException(status_code=403, detail="Rider access required")
    o = db.query(Order).filter(Order.id == order_id, Order.rider_id == current_user.id, Order.status == OrderStatus.OUT_FOR_DELIVERY.value).first()
    if not o:
        raise HTTPException(status_code=404, detail="Order not found")
    o.status = OrderStatus.DELIVERED.value
    record = db.query(DeliveryRecord).filter(DeliveryRecord.order_id == order_id, DeliveryRecord.rider_id == current_user.id).first()
    if record:
        record.status = "delivered"
        record.delivered_time = datetime.utcnow()
    db.commit()
    return {"message": "Order delivered"}

@router.get("/my-orders")
def my_orders(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "rider":
        raise HTTPException(status_code=403, detail="Rider access required")
    orders = db.query(Order).options(joinedload(Order.restaurant), joinedload(Order.items)).filter(Order.rider_id == current_user.id).order_by(Order.created_at.desc()).all()
    return [{"id": o.id, "order_number": o.order_number, "restaurant_name": o.restaurant.name,
             "delivery_address": o.delivery_address, "status": o.status,
             "total": o.total, "created_at": str(o.created_at)} for o in orders]
