from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, Enum, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from server.database import Base
import enum

class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    PREPARING = "preparing"
    OUT_FOR_DELIVERY = "out_for_delivery"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class UserRole(str, enum.Enum):
    CUSTOMER = "customer"
    RIDER = "rider"
    ADMIN = "admin"
    ANALYST = "analyst"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    phone = Column(String(20))
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.CUSTOMER)
    avatar_url = Column(String(500))
    wechat_openid = Column(String(100), unique=True, nullable=True)
    is_active = Column(Boolean, default=True)
    reset_token = Column(String(255), nullable=True)
    reset_token_expiry = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    orders = relationship("Order", foreign_keys="Order.user_id", back_populates="user")
    reviews = relationship("Review", back_populates="user")

class Restaurant(Base):
    __tablename__ = "restaurants"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    address = Column(String(500))
    phone = Column(String(20))
    logo_url = Column(String(500))
    cover_url = Column(String(500))
    latitude = Column(Float)
    longitude = Column(Float)
    rating = Column(Float, default=0)
    delivery_fee = Column(Float, default=0)
    min_order = Column(Float, default=0)
    estimated_time = Column(Integer, default=30)
    is_active = Column(Boolean, default=True)
    reset_token = Column(String(255), nullable=True)
    reset_token_expiry = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    categories = relationship("Category", back_populates="restaurant", cascade="all, delete-orphan")
    menu_items = relationship("MenuItem", back_populates="restaurant", cascade="all, delete-orphan")

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    name = Column(String(100), nullable=False)
    sort_order = Column(Integer, default=0)
    restaurant = relationship("Restaurant", back_populates="categories")
    menu_items = relationship("MenuItem", back_populates="category", cascade="all, delete-orphan")

class MenuItem(Base):
    __tablename__ = "menu_items"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    image_url = Column(String(500))
    is_available = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    discount_percent = Column(Integer, default=0)
    is_flash_sale = Column(Boolean, default=False)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
    restaurant = relationship("Restaurant", back_populates="menu_items")
    category = relationship("Category", back_populates="menu_items")
    options = relationship("MenuItemOption", back_populates="menu_item", cascade="all, delete-orphan")

class MenuItemOption(Base):
    __tablename__ = "menu_item_options"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"), nullable=False)
    name = Column(String(100), nullable=False)
    option_type = Column(String(20), default="single")
    is_required = Column(Boolean, default=False)
    sort_order = Column(Integer, default=0)
    menu_item = relationship("MenuItem", back_populates="options")
    choices = relationship("OptionChoice", back_populates="option", cascade="all, delete-orphan")

class OptionChoice(Base):
    __tablename__ = "option_choices"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    option_id = Column(Integer, ForeignKey("menu_item_options.id"), nullable=False)
    name = Column(String(100), nullable=False)
    price_adjustment = Column(Float, default=0)
    option = relationship("MenuItemOption", back_populates="choices")

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    order_number = Column(String(20), unique=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    rider_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(String(20), default=OrderStatus.PENDING.value)
    subtotal = Column(Float, nullable=False)
    delivery_fee = Column(Float, default=0)
    total = Column(Float, nullable=False)
    delivery_address = Column(Text)
    delivery_lat = Column(Float)
    delivery_lng = Column(Float)
    notes = Column(Text)
    payment_method = Column(String(50), default="cash")
    paid_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    user = relationship("User", foreign_keys=[user_id], back_populates="orders")
    restaurant = relationship("Restaurant")
    rider = relationship("User", foreign_keys=[rider_id])
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"), nullable=False)
    item_name = Column(String(200))
    quantity = Column(Integer, nullable=False, default=1)
    unit_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    selected_options = Column(JSON)
    order = relationship("Order", back_populates="items")

class Review(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    user = relationship("User", back_populates="reviews")
    order = relationship("Order", back_populates="reviews")
    restaurant = relationship("Restaurant")

class DeliveryRecord(Base):
    __tablename__ = "delivery_records"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    rider_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String(50))
    pickup_time = Column(DateTime, nullable=True)
    delivered_time = Column(DateTime, nullable=True)
    notes = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
