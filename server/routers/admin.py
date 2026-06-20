from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from server.database import get_db, get_mongo
from server.models.models import User, Order, OrderStatus, UserRole, MenuItem, Review
from server.routers.auth import get_current_user

router = APIRouter(prefix="/api/admin", tags=["admin"])

def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role not in ["admin", "analyst"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

@router.get("/users")
def list_users(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    users = db.query(User).all()
    return [{"id": u.id, "name": u.name, "email": u.email, "phone": u.phone, "role": u.role, "is_active": u.is_active, "created_at": str(u.created_at)} for u in users]

@router.put("/users/{user_id}/role")
def update_role(user_id: int, role: str, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admin can change roles")
    if role not in [r.value for r in UserRole]:
        raise HTTPException(status_code=400, detail="Invalid role")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = role
    db.commit()
    return {"message": "Role updated"}

@router.put("/users/{user_id}/toggle-active")
def toggle_active(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    db.commit()
    return {"message": "User status toggled", "is_active": user.is_active}

@router.get("/orders")
def all_orders(status: str = None, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    query = db.query(Order).options(joinedload(Order.restaurant), joinedload(Order.rider), joinedload(Order.user), joinedload(Order.items))
    if status:
        query = query.filter(Order.status == status)
    orders = query.order_by(Order.created_at.desc()).all()
    return [{"id": o.id, "order_number": o.order_number, "customer_name": o.user.name, "restaurant_name": o.restaurant.name, "rider_name": o.rider.name if o.rider else None, "status": o.status, "total": o.total, "created_at": str(o.created_at)} for o in orders]

# Analytics (Phase 3)
@router.get("/analytics/sales")
def sales_analytics(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    total_revenue = db.query(func.sum(Order.total)).filter(Order.status == OrderStatus.DELIVERED.value).scalar() or 0
    total_orders = db.query(func.count(Order.id)).filter(Order.status == OrderStatus.DELIVERED.value).scalar() or 0
    avg_order_value = total_revenue / total_orders if total_orders else 0
    by_status = db.query(Order.status, func.count(Order.id)).group_by(Order.status).all()
    return {"total_revenue": total_revenue, "total_orders": total_orders, "avg_order_value": avg_order_value, "orders_by_status": dict(by_status)}

@router.get("/analytics/top-items")
def top_items(limit: int = 10, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    from sqlalchemy import text
    sql = text("SELECT item_name, SUM(quantity) as total_qty, SUM(total_price) as total_rev FROM order_items GROUP BY item_name ORDER BY total_qty DESC LIMIT :lim")
    results = db.execute(sql, {"lim": limit}).fetchall()
    return [{"name": r[0], "quantity": r[1], "revenue": r[2]} for r in results]

@router.get("/analytics/user-growth")
def user_growth(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    from sqlalchemy import text
    sql = text("SELECT DATE(created_at) as date, COUNT(*) as count FROM users GROUP BY DATE(created_at) ORDER BY date")
    results = db.execute(sql).fetchall()
    return [{"date": str(r[0]), "count": r[1]} for r in results]

@router.get("/analytics/rider-performance")
def rider_performance(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    riders = db.query(User).filter(User.role == "rider").all()
    result = []
    for rider in riders:
        completed = db.query(func.count(Order.id)).filter(Order.rider_id == rider.id, Order.status == OrderStatus.DELIVERED.value).scalar() or 0
        total_rev = db.query(func.sum(Order.total)).filter(Order.rider_id == rider.id, Order.status == OrderStatus.DELIVERED.value).scalar() or 0
        result.append({"rider_id": rider.id, "rider_name": rider.name, "completed_orders": completed, "total_revenue": total_rev})
    return sorted(result, key=lambda x: x["completed_orders"], reverse=True)
