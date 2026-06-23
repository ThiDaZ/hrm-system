from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.models import Position, Department, User
from app.schemas.position import PositionCreate, PositionUpdate, PositionResponse
from app.api.routes.auth import get_current_user

router = APIRouter(prefix="/positions", tags=["Positions"])


@router.post("", response_model=PositionResponse, status_code=status.HTTP_201_CREATED)
def create_position(
        pos: PositionCreate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    # verify the department exists first
    db_dept = db.query(Department).filter(Department.id == pos.department_id).first()
    if not db_dept:
        raise HTTPException(status_code=400, detail="The specified department does not exist")

    # check if position title already exists within the same department
    db_pos = db.query(Position).filter(
        Position.title == pos.title,
        Position.department_id == pos.department_id
    ).first()
    if db_pos:
        raise HTTPException(status_code=400, detail="Position title already exists in this department")

    new_pos = Position(**pos.model_dump())
    db.add(new_pos)
    db.commit()
    db.refresh(new_pos)
    return new_pos


@router.get("", response_model=List[PositionResponse])
def get_positions(
        skip: int = 0,
        limit: int = 100,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    return db.query(Position).offset(skip).limit(limit).all()


@router.get("/{id}", response_model=PositionResponse)
def get_position(
        id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    pos = db.query(Position).filter(Position.id == id).first()
    if not pos:
        raise HTTPException(status_code=404, detail="Position not found")
    return pos


@router.patch("/{id}", response_model=PositionResponse)
def update_position(
        id: int,
        pos_update: PositionUpdate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    db_pos = db.query(Position).filter(Position.id == id).first()
    if not db_pos:
        raise HTTPException(status_code=404, detail="Position not found")

    # if updating the department_id, verify the new department exists
    if pos_update.department_id is not None:
        db_dept = db.query(Department).filter(Department.id == pos_update.department_id).first()
        if not db_dept:
            raise HTTPException(status_code=400, detail="The specified new department does not exist")

    update_data = pos_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_pos, key, value)

    db.commit()
    db.refresh(db_pos)
    return db_pos


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_position(
        id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    db_pos = db.query(Position).filter(Position.id == id).first()
    if not db_pos:
        raise HTTPException(status_code=404, detail="Position not found")

    db.delete(db_pos)
    db.commit()
    return None