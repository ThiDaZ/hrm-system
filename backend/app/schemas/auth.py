from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str

class UserCreate(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    role: str

    # read data from SQLAlchemy model
    class Config:
        from_attributes = True