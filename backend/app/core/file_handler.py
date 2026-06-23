import os
import shutil
from fastapi import UploadFile, HTTPException
from pathlib import Path
import uuid

UPLOAD_DIR = Path("uploads/employees")
MAX_FILE_SIZE = 1024 * 1024 * 5 # 5MB
ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf"]

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

def validate_and_save_file(file: UploadFile, employee_code:str) -> dict:
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail="Invalid file type: Only JPEG and PNG and PDF files are allowed.")

    file.file.seek(0,2)
    file_size = file.file.tell()
    file.file.seek(0)

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds the maximum limit of 5MB.")

    file_extension = Path(file.filename).suffix
    unique_filename = f"{employee_code}_{uuid.uuid4().hex}{file_extension}"
    file_path = UPLOAD_DIR / unique_filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "original_file_name": file.filename,
        "stored_file_name": unique_filename,
        "file_path": str(file_path),
        "file_size": file_size,
        "mime_type": file.content_type
    }

def delete_file(file_path: str):
    path = Path(file_path)
    if path.exists() and path.is_file():
        path.unlink()