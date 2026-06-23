from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, datetime

# --- Document Schemas ---
class EmployeeDocumentResponse(BaseModel):
    id: int
    document_type: str
    original_file_name: str
    file_path: str
    file_size: int
    mime_type: str
    uploaded_at: datetime

    class Config:
        from_attributes = True

# --- Employee Schemas ---
class EmployeeBase(BaseModel):
    employee_code: str
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    department_id: int
    position_id: int
    joining_date: date
    employment_type: str  # Full-Time, Contract
    basic_salary: float
    status: str = "ONBOARDING"  # ACTIVE, INACTIVE, ONBOARDING, TERMINATED

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    department_id: Optional[int] = None
    position_id: Optional[int] = None
    employment_type: Optional[str] = None
    basic_salary: Optional[float] = None
    status: Optional[str] = None

class EmployeeResponse(EmployeeBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    documents: List[EmployeeDocumentResponse] = []

    class Config:
        from_attributes = True