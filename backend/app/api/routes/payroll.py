from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.models import Payroll, Employee, User
from app.schemas.payroll import PayrollCreate, PayrollUpdate, PayrollResponse
from app.api.routes.auth import get_current_user

router = APIRouter(prefix="/payroll", tags=["Payroll"])


@router.post("", response_model=PayrollResponse, status_code=status.HTTP_201_CREATED)
def create_payroll(
        payroll_in: PayrollCreate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    # verify the employee exists
    emp = db.query(Employee).filter(Employee.id == payroll_in.employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    # prevent duplicate payrolls for the same month/year
    existing = db.query(Payroll).filter(
        Payroll.employee_id == payroll_in.employee_id,
        Payroll.month == payroll_in.month,
        Payroll.year == payroll_in.year
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="A payroll record already exists for this employee for this month."
        )

    # calculate the actual net salary securely on the server
    net_salary = payroll_in.basic_salary + payroll_in.bonuses - payroll_in.deductions

    new_payroll = Payroll(
        **payroll_in.model_dump(),
        net_salary=net_salary
    )

    db.add(new_payroll)
    db.commit()
    db.refresh(new_payroll)
    return new_payroll


@router.get("", response_model=List[PayrollResponse])
def get_all_payrolls(
        skip: int = 0,
        limit: int = 100,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    return db.query(Payroll).offset(skip).limit(limit).all()


@router.patch("/{id}", response_model=PayrollResponse)
def update_payroll_status(
        id: int,
        payroll_update: PayrollUpdate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    db_payroll = db.query(Payroll).filter(Payroll.id == id).first()
    if not db_payroll:
        raise HTTPException(status_code=404, detail="Payroll record not found")

    # changing from PENDING to PAID
    if payroll_update.status:
        db_payroll.status = payroll_update.status

    db.commit()
    db.refresh(db_payroll)
    return db_payroll