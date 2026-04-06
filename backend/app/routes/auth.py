from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from passlib.context import CryptContext

from app.database import get_async_db
from app.models.user import User

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ----------- SCHEMAS -----------

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


# ----------- HELPERS -----------

def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


# ----------- ROUTES -----------

@router.post("/register")
async def register(payload: RegisterRequest, db: AsyncSession = Depends(get_async_db)):
    # Check if user already exists
    result = await db.execute(select(User).where(User.email == payload.email))
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash password
    hashed_pw = hash_password(payload.password)

    # Create user
    new_user = User(
        email=payload.email,
        hashed_password=hashed_pw,
        full_name=payload.full_name
    )

    # Save to DB
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return {
        "message": "User created successfully",
        "user_id": new_user.id,
        "email": new_user.email
    }


@router.post("/login")
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_async_db)):
    # Find user
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    # Verify password
    if not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    # For now just return success (later you'll add JWT)
    return {
        "message": "Login successful",
        "user_id": user.id,
        "email": user.email
    }


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest):
    print(f"[forgot-password] password reset requested for: {payload.email}")
    return {"message": "If that email exists, a reset link has been sent."}