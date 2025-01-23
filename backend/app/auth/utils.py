# app/auth/utils.py
from typing import Optional
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.utils.database_utils import get_db
from app.datamodels.schemas import TokenData
from app.datamodels.datamodels import User

# Constants for JWT
SECRET_KEY = "your_secret_key"  # Replace with your actual secret key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token", auto_error=False)


async def get_current_user(
        request: Request,
        token: Optional[str] = Depends(oauth2_scheme),
        db: Session = Depends(get_db)
) -> User:
    """Decode and validate the JWT token, and retrieve the user from the database."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # First try to get token from OAuth2 scheme
    if not token:
        # If not found, try to get it from Authorization header
        auth_header = request.headers.get("Authorization")
        print(f"Auth header: {auth_header}")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
        else:
            print("No valid token found")
            raise credentials_exception

    try:
        print(f"Decoding token: {token}")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print(f"Token payload: {payload}")
        user_id: int = payload.get("sub")

        if user_id is None:
            print("No user_id in token payload")
            raise credentials_exception

        token_data = TokenData(user_id=user_id)
    except JWTError as e:
        print(f"JWT decode error: {str(e)}")
        raise credentials_exception

    user = db.query(User).filter(User.user_id == token_data.user_id).first()
    if user is None:
        print(f"No user found for id: {token_data.user_id}")
        raise credentials_exception

    print(f"Found user: {user.user_id}")
    return user


def create_access_token(data: dict) -> str:
    """Generate a JWT token."""
    to_encode = data.copy()
    print(f"Creating token with data: {to_encode}")
    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    print(f"Created token: {token}")
    return token