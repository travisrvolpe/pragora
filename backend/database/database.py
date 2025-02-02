from sqlalchemy.ext.declarative import DeclarativeMeta, declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from databases import Database

DATABASE_URL = "postgresql://postgres:ugabuga22@localhost:5432/pragora"
#UPLOAD_FOLDER = "./media/posts/"
#ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base: DeclarativeMeta = declarative_base()
database = Database(DATABASE_URL)
