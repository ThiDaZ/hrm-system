from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import engine, Base
from app.api.routes import auth, departments, positions, employees, payroll

Base.metadata.create_all(bind=engine)

app = FastAPI(title="HRM System API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(departments.router)
app.include_router(positions.router)
app.include_router(employees.router)
app.include_router(payroll.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the HRM System API"}