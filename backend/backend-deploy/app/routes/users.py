# app/routes/users.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.database import get_async_db
from app.services import user_service

router = APIRouter()


# Schemas for requests
class UserRegister(BaseModel):
    email: str
    password: str
    full_name: str | None = None


class UserLogin(BaseModel):
    email: str
    password: str


# POST /users/register
@router.post("/register")
async def register(user_data: UserRegister, db: AsyncSession = Depends(get_async_db)):
    # Check if user already exists
    existing_user = await user_service.authenticate_user(db, user_data.email, user_data.password)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Register new user
    user = await user_service.register_user(
        db,
        email=user_data.email,
        password=user_data.password,
        full_name=user_data.full_name
    )
    return {"id": user.id, "email": user.email, "full_name": user.full_name}


# POST /users/login
@router.post("/login")
async def login(user_data: UserLogin, db: AsyncSession = Depends(get_async_db)):
    user = await user_service.authenticate_user(db, user_data.email, user_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"id": user.id, "email": user.email, "full_name": user.full_name}