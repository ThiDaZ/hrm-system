from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PositionBase(BaseModel):
    title: str
    description: Optional[str] = None
    is_active: bool = True
    department_id: int

class PositionCreate(PositionBase):
    pass

class PositionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    department_id: Optional[int] = None

class PositionResponse(PositionBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True