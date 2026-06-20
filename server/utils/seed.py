import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from server.database import SessionLocal, engine, Base
from server.models.models import User, UserRole, Restaurant, Category, MenuItem, MenuItemOption, OptionChoice
from server.utils.auth_utils import hash_password

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded
    if db.query(User).first():
        print("Database already has data, skipping seed.")
        db.close()
        return

    # Users
    customers = [
        User(name="Alice", email="alice@test.com", password_hash=hash_password("123456"), role=UserRole.CUSTOMER.value),
        User(name="Bob", email="bob@test.com", password_hash=hash_password("123456"), role=UserRole.CUSTOMER.value),
    ]
    riders = [
        User(name="Rider Ken", email="rider1@test.com", password_hash=hash_password("123456"), role=UserRole.RIDER.value),
        User(name="Rider Jane", email="rider2@test.com", password_hash=hash_password("123456"), role=UserRole.RIDER.value),
    ]
    admin = User(name="Admin", email="admin@test.com", password_hash=hash_password("admin123"), role=UserRole.ADMIN.value)
    analyst = User(name="Analyst", email="analyst@test.com", password_hash=hash_password("123456"), role=UserRole.ANALYST.value)
    for u in customers + riders + [admin, analyst]:
        db.add(u)
    db.flush()

    # Restaurant
    r1 = Restaurant(name="Pizza Palace", description="Delicious Italian pizzas and pastas",
                    address="123 Main Street", phone="13800000001",
                    logo_url="", cover_url="", rating=4.5,
                    delivery_fee=5.0, min_order=20.0, estimated_time=30)
    r2 = Restaurant(name="Sushi House", description="Fresh Japanese sushi and sashimi",
                    address="456 Oak Avenue", phone="13800000002",
                    logo_url="", cover_url="", rating=4.8,
                    delivery_fee=8.0, min_order=30.0, estimated_time=40)
    r3 = Restaurant(name="Noodle Bar", description="Authentic Chinese noodles and dumplings",
                    address="789 Pine Road", phone="13800000003",
                    logo_url="", cover_url="", rating=4.3,
                    delivery_fee=3.0, min_order=15.0, estimated_time=25)
    for r in [r1, r2, r3]:
        db.add(r)
    db.flush()

    # Categories & Menu Items for Pizza Palace
    c_pizza = Category(restaurant_id=r1.id, name="Pizzas", sort_order=1)
    c_drinks = Category(restaurant_id=r1.id, name="Drinks", sort_order=2)
    db.add_all([c_pizza, c_drinks])
    db.flush()

    pizzas = [
        MenuItem(restaurant_id=r1.id, category_id=c_pizza.id, name="Margherita", description="Classic tomato and mozzarella", price=12.99, is_featured=True),
        MenuItem(restaurant_id=r1.id, category_id=c_pizza.id, name="Pepperoni", description="Pepperoni and cheese", price=14.99, is_featured=True),
        MenuItem(restaurant_id=r1.id, category_id=c_pizza.id, name="Hawaiian", description="Ham and pineapple", price=13.99),
        MenuItem(restaurant_id=r1.id, category_id=c_pizza.id, name="Vegetarian", description="Fresh vegetables and cheese", price=11.99),
    ]
    drinks = [
        MenuItem(restaurant_id=r1.id, category_id=c_drinks.id, name="Coca Cola", description="", price=2.99),
        MenuItem(restaurant_id=r1.id, category_id=c_drinks.id, name="Orange Juice", description="Fresh squeezed", price=3.99),
    ]
    db.add_all(pizzas + drinks)
    db.flush()

    # Options for Margherita
    size_opt = MenuItemOption(menu_item_id=pizzas[0].id, name="Size", option_type="single", is_required=True, sort_order=1)
    db.add(size_opt)
    db.flush()
    db.add_all([
        OptionChoice(option_id=size_opt.id, name="Small (10 inch)", price_adjustment=0),
        OptionChoice(option_id=size_opt.id, name="Medium (12 inch)", price_adjustment=3.0),
        OptionChoice(option_id=size_opt.id, name="Large (14 inch)", price_adjustment=5.0),
    ])
    extra_opt = MenuItemOption(menu_item_id=pizzas[0].id, name="Extras", option_type="multiple", is_required=False, sort_order=2)
    db.add(extra_opt)
    db.flush()
    db.add_all([
        OptionChoice(option_id=extra_opt.id, name="Extra Cheese", price_adjustment=1.5),
        OptionChoice(option_id=extra_opt.id, name="Mushrooms", price_adjustment=1.0),
        OptionChoice(option_id=extra_opt.id, name="Olives", price_adjustment=1.0),
    ])

    # Categories & Menu Items for Sushi House
    c_sushi = Category(restaurant_id=r2.id, name="Sushi Rolls", sort_order=1)
    c_sides = Category(restaurant_id=r2.id, name="Sides", sort_order=2)
    db.add_all([c_sushi, c_sides])
    db.flush()
    sushi_items = [
        MenuItem(restaurant_id=r2.id, category_id=c_sushi.id, name="California Roll", description="Crab, avocado, cucumber", price=8.99, is_featured=True),
        MenuItem(restaurant_id=r2.id, category_id=c_sushi.id, name="Salmon Nigiri", description="Fresh salmon over rice (2 pcs)", price=6.99, is_featured=True),
        MenuItem(restaurant_id=r2.id, category_id=c_sushi.id, name="Dragon Roll", description="Eel, avocado, cucumber", price=10.99),
    ]
    sides = [
        MenuItem(restaurant_id=r2.id, category_id=c_sides.id, name="Miso Soup", description="", price=3.50),
        MenuItem(restaurant_id=r2.id, category_id=c_sides.id, name="Edamame", description="", price=4.50),
    ]
    db.add_all(sushi_items + sides)
    db.flush()

    # Categories & Menu Items for Noodle Bar
    c_noodles = Category(restaurant_id=r3.id, name="Noodles", sort_order=1)
    c_dumplings = Category(restaurant_id=r3.id, name="Dumplings", sort_order=2)
    db.add_all([c_noodles, c_dumplings])
    db.flush()
    noodles = [
        MenuItem(restaurant_id=r3.id, category_id=c_noodles.id, name="Beef Noodle Soup", description="Hand-pulled noodles in beef broth", price=9.99, is_featured=True),
        MenuItem(restaurant_id=r3.id, category_id=c_noodles.id, name="Dan Dan Noodles", description="Spicy Sichuan noodles", price=8.99),
        MenuItem(restaurant_id=r3.id, category_id=c_noodles.id, name="Chow Mein", description="Stir-fried noodles with vegetables", price=7.99),
    ]
    dumpling_items = [
        MenuItem(restaurant_id=r3.id, category_id=c_dumplings.id, name="Pork Dumplings", description="Steamed pork dumplings (8 pcs)", price=8.99, is_featured=True),
        MenuItem(restaurant_id=r3.id, category_id=c_dumplings.id, name="Vegetable Dumplings", description="Steamed veggie dumplings (8 pcs)", price=7.99),
    ]
    db.add_all(noodles + dumpling_items)
    db.flush()

    db.commit()
    db.close()
    print("Seed data created successfully!")
    print("")
    print("Test accounts:")
    print("  Admin:    admin@test.com / admin123")
    print("  Customer: alice@test.com / 123456")
    print("  Customer: bob@test.com / 123456")
    print("  Rider:    rider1@test.com / 123456")
    print("  Rider:    rider2@test.com / 123456")
    print("  Analyst:  analyst@test.com / 123456")

if __name__ == "__main__":
    seed()
