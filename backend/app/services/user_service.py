from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.repositories import user_repository

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


async def register_user(db: AsyncSession, email: str, password: str, full_name: str | None = None) -> User:
    hashed_pw = hash_password(password)
    user = User(email=email, hashed_password=hashed_pw, full_name=full_name)
    return await user_repository.create_user(db, user)


async def authenticate_user(db: AsyncSession, email: str, password: str) -> User | None:
    user = await user_repository.get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user