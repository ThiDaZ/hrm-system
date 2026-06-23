from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PayrollBase(BaseModel):
    employee_id: int
    month: int
    year: int
    basic_salary: float
    bonuses: float = 0.0
    deductions: float = 0.0
    status: str = "PENDING"  # PENDING, PAID

class PayrollCreate(PayrollBase):
    pass

class PayrollUpdate(BaseModel):
    status: Optional[str] = None

class PayrollResponse(PayrollBase):
    id: int
    net_salary: float
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True