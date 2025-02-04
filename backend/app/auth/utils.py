# app/auth/utils.py
from typing import Optional
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.utils.database_utils import get_db
from app.datamodels.datamodels import User
from app.core.config import settings
from datetime import datetime, timedelta

# Constants for JWT
SECRET_KEY = settings.JWT_SECRET_KEY
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # (24 hours)


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token", auto_error=False)


async def get_current_user(
        request: Request,
        token: Optional[str] = Depends(oauth2_scheme),
        db: Session = Depends(get_db)
) -> User:
    """Decode and validate JWT token, and retrieve user from database."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Get token from OAuth2 scheme or Authorization header
    if not token:
        auth_header = request.headers.get("Authorization")
        print(f"🔑 Auth header: {auth_header}")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
        else:
            print("❌ No valid token found")
            raise credentials_exception

    try:
        print(f"🔄 Decoding token: {token}")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print(f"✅ Token payload: {payload}")

        user_id: int = payload.get("sub")
        if not user_id:
            print("❌ No user_id in token payload")
            raise credentials_exception

        # Convert user_id to int if it's a string
        if isinstance(user_id, str):
            user_id = int(user_id)

        # Get user from database
        user = db.query(User).filter(User.user_id == user_id).first()
        if not user:
            print(f"❌ No user found for id: {user_id}")
            raise credentials_exception

        print(f"✅ Found user: {user.user_id}")
        return user

    except JWTError as e:
        print(f"❌ JWT decode error: {str(e)}")
        raise credentials_exception
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        raise credentials_exception

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    print(f"Creating token with data: {to_encode}")
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    print(f"Token expires at: {expire}")
    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    print(f"Created token: {token}")
    return token