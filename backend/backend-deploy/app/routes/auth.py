from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from passlib.context import CryptContext
from typing import Optional
from datetime import datetime, timedelta, timezone
from jose import jwt
from app.database import get_async_db
from app.models.user import User
from app.config import get_settings

router = APIRouter()
settings = get_settings()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ----------- SCHEMAS -----------

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None


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


def create_access_token(user_id: int) -> str:
    """
    Generate a JWT access token with expiration.
    
    Args:
        user_id: The user's database ID
        
    Returns:
        Encoded JWT token string
    """
    # Calculate expiration time
    expires_delta = timedelta(minutes=settings.access_token_expire_minutes)
    expire = datetime.now(timezone.utc) + expires_delta
    
    # Create token payload
    to_encode = {
        "sub": str(user_id),
        "exp": expire,
    }
    
    # Encode and return JWT
    encoded_jwt = jwt.encode(
        to_encode,
        settings.secret_key,
        algorithm=settings.algorithm
    )
    return encoded_jwt


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

    # Verify password - check for null hashed_password first
    if not user.hashed_password or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    # Generate JWT token
    access_token = create_access_token(user.id)

    # Return response in format expected by frontend
    return {
        "message": "Login successful",
        "token": access_token,
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.full_name or user.email.split('@')[0]
        }
    }


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest):
    print(f"[forgot-password] password reset requested for: {payload.email}")
    return {"message": "If that email exists, a reset link has been sent."}