from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.database import get_db
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
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == payload.email).first()
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
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User created successfully",
        "user_id": new_user.id,
        "email": new_user.email
    }


@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    # Find user
    user = db.query(User).filter(User.email == payload.email).first()

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