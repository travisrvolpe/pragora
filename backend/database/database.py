# database/database.py
from databases import Database
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import DeclarativeMeta, declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql://postgres:ugabuga22@localhost:5432/pragora"

# Create the SQLAlchemy engine
engine = create_engine(DATABASE_URL)

# Create the sessionmaker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create the declarative base
Base: DeclarativeMeta = declarative_base()

# Create the async database instance
database = Database(DATABASE_URL)