# utils/database_utils.py
from sqlalchemy.orm import sessionmaker
from database.database import engine
from app.datamodels.post_datamodels import Category, Subcategory, PostType

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


async def init_categories():
    db = SessionLocal()
    try:
        categories_data = [
            {"name": "Self-Development",
             "subcategories": ["Health & Wellness", "Personal Growth", "Skill Development"]},
            {"name": "Home & Habitat", "subcategories": ["Home Design", "Gardening", "DIY", "Smart Homes"]},
            {"name": "Nature & Environment", "subcategories": ["Animals", "Sustainability", "Conservation"]},
            {"name": "Science & Technology", "subcategories": ["Engineering", "AI"]},
            {"name": "Philosophy", "subcategories": ["Ethics", "Metaphysics"]},
            {"name": "Economics & Business", "subcategories": ["Finance", "Entrepreneurship"]},
            {"name": "Society & Culture", "subcategories": ["Politics", "History"]},
            {"name": "Civic Engagement", "subcategories": ["Volunteerism", "Governance"]},
            {"name": "Entertainment", "subcategories": ["Pop Culture", "Media"]},
            {"name": "Miscellaneous", "subcategories": []}
        ]

        for cat_data in categories_data:
            category = db.query(Category).filter(Category.cat_name == cat_data["name"]).first()
            if not category:
                category = Category(cat_name=cat_data["name"])
                db.add(category)
                db.flush()

                for sub_name in cat_data["subcategories"]:
                    subcategory = Subcategory(name=sub_name, category_id=category.category_id)
                    db.add(subcategory)

        db.commit()
    finally:
        db.close()


async def init_post_types():
    db = SessionLocal()
    try:
        post_types_data = [
            {"id": 1, "name": "thoughts"},
            {"id": 2, "name": "image"},
            {"id": 3, "name": "article"},
            {"id": 4, "name": "video"}
        ]

        for type_data in post_types_data:
            post_type = db.query(PostType).filter(PostType.post_type_id == type_data["id"]).first()
            if not post_type:
                post_type = PostType(
                    post_type_id=type_data["id"],
                    post_type_name=type_data["name"]
                )
                db.add(post_type)

        db.commit()
    finally:
        db.close()