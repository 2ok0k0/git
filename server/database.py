from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from server.config import DATABASE_URL

engine = create_engine(DATABASE_URL, echo=False, connect_args={})
if "sqlite" in DATABASE_URL:
    from sqlalchemy import event
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

mongo_client = None
mongo_db = None

def get_mongo():
    global mongo_client, mongo_db
    if mongo_client is None:
        try:
            from pymongo import MongoClient
            from server.config import MONGO_URL, MONGO_DATABASE
            mongo_client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=2000)
            mongo_db = mongo_client[MONGO_DATABASE]
        except Exception:
            return None
    return mongo_db
