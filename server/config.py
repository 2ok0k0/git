import os

SERVER_HOST = "0.0.0.0"
SERVER_PORT = 8000

SECRET_KEY = "enatega-food-delivery-secret-key-2026"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

# Database: SQLite default, set env vars for MySQL
DB_TYPE = os.getenv("DB_TYPE", "sqlite")  # sqlite or mysql
if DB_TYPE == "mysql":
    MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
    MYSQL_PORT = int(os.getenv("MYSQL_PORT", 3306))
    MYSQL_USER = os.getenv("MYSQL_USER", "root")
    MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
    MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "enatega")
    DATABASE_URL = "mysql+pymysql://{}:{}@{}:{}/{}?charset=utf8mb4".format(
        MYSQL_USER, MYSQL_PASSWORD, MYSQL_HOST, MYSQL_PORT, MYSQL_DATABASE
    )
else:
    DB_PATH = os.path.join(os.path.dirname(__file__), "enatega.db")
    DATABASE_URL = "sqlite:///{}?check_same_thread=False".format(DB_PATH.replace("\\", "/"))

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
MONGO_DATABASE = "enatega_unstructured"
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "outputs")
MAX_UPLOAD_SIZE = 10 * 1024 * 1024

WECHAT_APP_ID = ""
WECHAT_APP_SECRET = ""
