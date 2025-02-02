# app/database/init_db.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# Import the Base and your model definitions from correct paths
from database.database import Base  # Corrected import path
from app.datamodels.datamodels import User
from app.datamodels.datamodels import UserProfile #Importing to make tables
#from app.datamodels.datamodels import Post # No post table yet

#from app.models.user_model import User
#from app.models.post_model import Post

DATABASE_URL = "postgresql://postgres:ugabuga22@localhost:5432/pragora"
UPLOAD_FOLDER = "./media/posts/"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def create_all_tables():
    # Create the tables.
    Base.metadata.create_all(bind=engine)
    print("All Tables Created")

def seed_database():
    """Seeds the database with initial data (optional)."""
    db = SessionLocal()
    try:
        #Example Seed Data:
        # Create a sample user
        # from app.models.user_model import User #Make sure to import the user model
        # new_user = User(username="testuser", email="test@example.com")  # Add other fields
        # db.add(new_user)

        # # Create a sample post
        # from app.models.post_model import Post
        # new_post = Post(title="Sample Post", content="This is a sample post.", user_id=new_user.id)
        # db.add(new_post)

        # You can add more seed data as needed
        db.commit()
        print("Database seeded with initial data.")

    except Exception as e:
        db.rollback() # Rollback in case of error
        print(f"Error seeding database: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    create_all_tables()
    seed_database()  #Optional to seed the data
    print("Database initialized.")