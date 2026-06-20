import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from server.config import SERVER_HOST, SERVER_PORT
from server.routers import auth, restaurants, orders, riders, admin, upload, merchants, chat

app = FastAPI(title="Enatega Food Delivery", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(restaurants.router)
app.include_router(orders.router)
app.include_router(riders.router)
app.include_router(admin.router)
app.include_router(upload.router)
app.include_router(merchants.router)
app.include_router(chat.router)

static_dir = os.path.join(os.path.dirname(__file__), "outputs")
os.makedirs(static_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/api/health")
def health():
    return {"status": "ok", "message": "Enatega API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server.main:app", host=SERVER_HOST, port=SERVER_PORT, reload=True)
