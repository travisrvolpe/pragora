from sqlalchemy.orm import sessionmaker
from database.database import engine

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    print("Creating database session")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()