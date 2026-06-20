from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

router = APIRouter(prefix="/api/chat", tags=["chat"])

# In-memory message store
store = {}

class ChatSend(BaseModel):
    order_id: int
    sender: str
    text: str
    sender_name: Optional[str] = ""

@router.post("/send")
def send(msg: ChatSend):
    key = str(msg.order_id)
    if key not in store:
        store[key] = []
    store[key].append({
        "sender": msg.sender,
        "text": msg.text,
        "sender_name": msg.sender_name,
        "time": datetime.utcnow().isoformat()
    })
    return {"ok": True}

@router.get("/messages/{order_id}")
def get_messages(order_id: int):
    key = str(order_id)
    return store.get(key, [])
