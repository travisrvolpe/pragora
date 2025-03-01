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
    print(f"📢 Received token in FastAPI: {token}")

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Get token from OAuth2 scheme or Authorization header
        if not token:
            auth_header = request.headers.get("Authorization")
            print(f"🔑 Auth header from request: {auth_header}")
            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
            else:
                print("❌ No valid token found")
                raise credentials_exception

        print(f"🔄 Decoding token: {token}")
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            print(f"✅ Token payload: {payload}")

            # Add expiration check
            exp = payload.get('exp')
            if exp and datetime.utcnow() > datetime.fromtimestamp(exp):
                raise credentials_exception

        except JWTError as jwt_error:
            print(f"❌ JWT decode error: {str(jwt_error)}")
            raise credentials_exception

        user_id: int = payload.get("sub")
        if not user_id:
            print("❌ No user_id in token payload")
            raise credentials_exception

        if isinstance(user_id, str):
            user_id = int(user_id)

        user = db.query(User).filter(User.user_id == user_id).first()
        if not user:
            print(f"❌ No user found for id: {user_id}")
            raise credentials_exception

        print(f"✅ Found user: {user.user_id}")
        return user

    except Exception as e:
        print(f"❌ Unexpected error in get_current_user: {str(e)}")
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