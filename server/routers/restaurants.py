from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from server.database import get_db
from server.models.models import Restaurant, Category, MenuItem, MenuItemOption, OptionChoice

router = APIRouter(prefix="/api/restaurants", tags=["restaurants"])

@router.get("")
def list_restaurants(db: Session = Depends(get_db)):
    restaurants = db.query(Restaurant).filter(Restaurant.is_active == True).all()
    return [{"id": r.id, "name": r.name, "description": r.description, "address": r.address,
             "logo_url": r.logo_url, "cover_url": r.cover_url, "rating": r.rating,
             "delivery_fee": r.delivery_fee, "min_order": r.min_order,
             "estimated_time": r.estimated_time, "latitude": r.latitude, "longitude": r.longitude}
            for r in restaurants]

@router.get("/{restaurant_id}")
def get_restaurant(restaurant_id: int, db: Session = Depends(get_db)):
    r = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return {"id": r.id, "name": r.name, "description": r.description, "address": r.address,
            "logo_url": r.logo_url, "cover_url": r.cover_url, "rating": r.rating,
            "delivery_fee": r.delivery_fee, "min_order": r.min_order,
            "estimated_time": r.estimated_time, "latitude": r.latitude, "longitude": r.longitude}

@router.get("/{restaurant_id}/menu")
def get_menu(restaurant_id: int, db: Session = Depends(get_db)):
    r = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    categories = db.query(Category).filter(Category.restaurant_id == restaurant_id).order_by(Category.sort_order).all()
    result = []
    for cat in categories:
        items = db.query(MenuItem).filter(MenuItem.category_id == cat.id, MenuItem.is_available == True).order_by(MenuItem.sort_order).all()
        item_list = []
        for item in items:
            options = db.query(MenuItemOption).filter(MenuItemOption.menu_item_id == item.id).order_by(MenuItemOption.sort_order).all()
            option_list = []
            for opt in options:
                choices = db.query(OptionChoice).filter(OptionChoice.option_id == opt.id).all()
                option_list.append({
                    "id": opt.id, "name": opt.name, "option_type": opt.option_type,
                    "is_required": opt.is_required,
                    "choices": [{"id": c.id, "name": c.name, "price_adjustment": c.price_adjustment} for c in choices]
                })
            item_list.append({
                "id": item.id, "name": item.name, "description": item.description,
                "price": item.price, "image_url": item.image_url, "is_featured": item.is_featured,
                "options": option_list
            })
        result.append({"id": cat.id, "name": cat.name, "items": item_list})
    return result
