from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
from pathlib import Path

from app.db.database import get_db
from app.models.models import Employee, EmployeeDocument, Department, Position, User
from app.schemas.employee import EmployeeCreate, EmployeeUpdate, EmployeeResponse, EmployeeDocumentResponse
from app.api.routes.auth import get_current_user
from app.core.file_handler import validate_and_save_file, delete_file

router = APIRouter(prefix="/employees", tags=["Employees"])


# EMPLOYEE CRUD OPERATIONS

@router.post("", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(
        emp: EmployeeCreate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    # verify employee code is unique
    if db.query(Employee).filter(Employee.employee_code == emp.employee_code).first():
        raise HTTPException(status_code=400, detail="Employee code already exists")
    if db.query(Employee).filter(Employee.email == emp.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    # verify dept and position exist
    if not db.query(Department).filter(Department.id == emp.department_id).first():
        raise HTTPException(status_code=400, detail="Department not found")
    if not db.query(Position).filter(Position.id == emp.position_id).first():
        raise HTTPException(status_code=400, detail="Position not found")

    new_emp = Employee(**emp.model_dump())
    db.add(new_emp)
    db.commit()
    db.refresh(new_emp)
    return new_emp


@router.get("", response_model=List[EmployeeResponse])
def get_employees(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Employee).all()


@router.get("/{id}", response_model=EmployeeResponse)
def get_employee(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    emp = db.query(Employee).filter(Employee.id == id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return emp


@router.patch("/{id}", response_model=EmployeeResponse)
def update_employee(
        id: int,
        emp_update: EmployeeUpdate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    db_emp = db.query(Employee).filter(Employee.id == id).first()
    if not db_emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    update_data = emp_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_emp, key, value)

    db.commit()
    db.refresh(db_emp)
    return db_emp


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_emp = db.query(Employee).filter(Employee.id == id).first()
    if not db_emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    # delete physical files from the hard drive before deleting DB records
    for doc in db_emp.documents:
        delete_file(doc.file_path)

    db.delete(db_emp)
    db.commit()
    return None


# DOCUMENT UPLOAD & MANAGEMENT

@router.post("/{id}/documents", response_model=EmployeeDocumentResponse)
def upload_document(
        id: int,
        document_type: str = Form(...),  # read from Form Data, not JSON
        file: UploadFile = File(...),  # raed the actual binary file
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    emp = db.query(Employee).filter(Employee.id == id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    # use our custom file handler to validate and save to disk
    file_info = validate_and_save_file(file, emp.employee_code)

    # save the record to the database
    new_doc = EmployeeDocument(
        employee_id=emp.id,
        document_type=document_type,
        original_file_name=file_info["original_file_name"],
        stored_file_name=file_info["stored_file_name"],
        file_path=file_info["file_path"],
        file_size=file_info["file_size"],
        mime_type=file_info["mime_type"],
        uploaded_by=current_user.id
    )

    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)
    return new_doc


@router.get("/{id}/documents", response_model=List[EmployeeDocumentResponse])
def get_employee_documents(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(EmployeeDocument).filter(EmployeeDocument.employee_id == id).all()


@router.get("/documents/{document_id}/download")
def download_document(document_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    doc = db.query(EmployeeDocument).filter(EmployeeDocument.id == document_id).first()
    if not doc or not Path(doc.file_path).exists():
        raise HTTPException(status_code=404, detail="Document file not found")

    # send the actual file back to the browser
    return FileResponse(
        path=doc.file_path,
        filename=doc.original_file_name,
        media_type=doc.mime_type
    )


@router.delete("/documents/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee_document(document_id: int, db: Session = Depends(get_db),
                             current_user: User = Depends(get_current_user)):
    doc = db.query(EmployeeDocument).filter(EmployeeDocument.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    delete_file(doc.file_path)

    db.delete(doc)
    db.commit()
    return None