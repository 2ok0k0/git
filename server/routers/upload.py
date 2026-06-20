import os
from fastapi import APIRouter, UploadFile, File, HTTPException
from server.config import UPLOAD_DIR, MAX_UPLOAD_SIZE
import uuid

router = APIRouter(prefix="/api/upload", tags=["upload"])

@router.post("")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    ext = os.path.splitext(file.filename)[1] or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    filepath = os.path.join(UPLOAD_DIR, filename)
    content = await file.read()
    if len(content) > MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=400, detail="File too large")
    with open(filepath, "wb") as f:
        f.write(content)
    return {"url": f"/static/{filename}", "filename": filename}
