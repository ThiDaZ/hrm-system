from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.models import Department, User
from app.schemas.department import DepartmentCreate, DepartmentUpdate, DepartmentResponse
from app.api.routes.auth import get_current_user

router = APIRouter(prefix="/departments", tags=["Departments"])

@router.post('/', response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED)
def create_department(
        dept: DepartmentCreate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    db_dept = db.query(Department).filter(Department.name == dept.name).first()
    if db_dept:
        raise HTTPException(status_code=400, detail="Department already exists")

    new_dept = Department(**dept.model_dump())
    db.add(new_dept)
    db.commit()
    db.refresh(new_dept)
    return new_dept

@router.get('/', response_model=List[DepartmentResponse])
def get_departments(
        skip: int = 0,
        limit: int = 100,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    return db.query(Department).offset(skip).limit(limit).all()

@router.get('/{id}', response_model=DepartmentResponse)
def get_department(
        id:int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    dept = db.query(Department).filter(Department.id == id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    return dept


@router.patch("/{id}", response_model=DepartmentResponse)
def update_department(
        id: int,
        dept_update: DepartmentUpdate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    db_dept = db.query(Department).filter(Department.id == id).first()
    if not db_dept:
        raise HTTPException(status_code=404, detail="Department not found")

    update_data = dept_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_dept, key, value)

    db.commit()
    db.refresh(db_dept)
    return db_dept



@router.delete('/{id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_department(
        id:int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    db_dept = db.query(Department).filter(Department.id == id).first()
    if not db_dept:
        raise HTTPException(status_code=404, detail="Department not found")

    db.delete(db_dept)
    db.commit()
    return None
