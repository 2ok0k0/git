from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from server.database import get_db
from server.models.models import User, UserRole
from server.utils.auth_utils import hash_password, verify_password, create_access_token, decode_token

router = APIRouter(prefix="/api/auth", tags=["auth"])
security = HTTPBearer()

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    phone: str = ""
    role: str = "customer"

class LoginRequest(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    token: str
    user: dict

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    try:
        payload = decode_token(credentials.credentials)
        user_id = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.id == user_id).first()
    if user is None or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")
    return user

@router.post("/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if req.role not in [r.value for r in UserRole]:
        raise HTTPException(status_code=400, detail="Invalid role")
    user = User(
        name=req.name, email=req.email, phone=req.phone,
        password_hash=hash_password(req.password), role=req.role
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token({"user_id": user.id, "role": user.role})
    return AuthResponse(token=token, user={"id": user.id, "name": user.name, "email": user.email, "role": user.role})

@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account deactivated")
    token = create_access_token({"user_id": user.id, "role": user.role})
    return AuthResponse(token=token, user={"id": user.id, "name": user.name, "email": user.email, "role": user.role, "phone": user.phone, "avatar_url": user.avatar_url})

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {"id": current_user.id, "name": current_user.name, "email": current_user.email, "role": current_user.role, "phone": current_user.phone, "avatar_url": current_user.avatar_url}


@router.post("/forgot-password")
def forgot_password(email: str, db: Session = Depends(get_db)):
    import uuid, datetime
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return {"message": "If the email exists, a reset link has been sent"}
    token = uuid.uuid4().hex
    user.reset_token = token
    user.reset_token_expiry = datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    db.commit()
    return {"message": "Reset token generated (demo)", "reset_token": token, "email": email}

@router.post("/reset-password")
def reset_password(token: str, new_password: str, db: Session = Depends(get_db)):
    import datetime
    user = db.query(User).filter(User.reset_token == token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid token")
    now = datetime.datetime.utcnow()
    if user.reset_token_expiry and user.reset_token_expiry < now:
        raise HTTPException(status_code=400, detail="Token expired")
    user.password_hash = hash_password(new_password)
    user.reset_token = None
    user.reset_token_expiry = None
    db.commit()
    return {"message": "Password reset successful"}

@router.post("/wechat-login")
def wechat_login(code: str = "", db: Session = Depends(get_db)):
    # Demo: simulate WeChat login with a hardcoded account
    user = db.query(User).filter(User.email == "alice@test.com").first()
    token = create_access_token({"user_id": user.id, "role": user.role})
    return {"token": token, "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role}, "is_new_user": False}
