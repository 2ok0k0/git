import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from server.database import engine, Base
from server.models.models import User, Restaurant, Category, MenuItem, Order, OrderItem, Review

def init():
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    init()
