from sqlalchemy.orm import Session
from app.datamodels.post_datamodels import Category, Subcategory

categories_data = [
    {"name": "Self-Development", "subcategories": ["Health & Wellness", "Personal Growth", "Skill Development"]},
    {"name": "Home & Habitat", "subcategories": ["Home Design", "Gardening", "DIY", "Smart Homes"]},
    {"name": "Nature & Environment", "subcategories": ["Animals", "Sustainability", "Conservation"]},
    {"name": "Science & Technology", "subcategories": ["Engineering", "AI"]},
    {"name": "Philosophy", "subcategories": ["Ethics", "Metaphysics"]},
    {"name": "Economics & Business", "subcategories": ["Finance", "Entrepreneurship"]},
    {"name": "Society & Culture", "subcategories": ["Politics", "History"]},
    {"name": "Civic Engagement", "subcategories": ["Volunteerism", "Governance"]},
    {"name": "Entertainment", "subcategories": ["Pop Culture", "Media"]},
    {"name": "Miscellaneous", "subcategories": []},
]

post_types_data = [
    {"post_type_id": 1, "post_type_name": "Thought"},
    {"post_type_id": 2, "post_type_name": "Image"},
    {"post_type_id": 3, "post_type_name": "Article"},
]

def populate_categories(session: Session):
    for category in categories_data:
        category_obj = Category(name=category["name"])
        session.add(category_obj)
        session.flush()  # Get category ID for subcategories

        for subcategory_name in category["subcategories"]:
            subcategory_obj = Subcategory(name=subcategory_name, category_id=category_obj.id)
            session.add(subcategory_obj)

    session.commit()

def populate_post_types(session: Session):
    for post_type in post_types_data:
        existing_type = session.query(PostType).filter_by(post_type_id=post_type["post_type_id"]).first()
        if not existing_type:
            post_type_obj = PostType(post_type_id=post_type["post_type_id"], post_type_name=post_type["post_type_name"])
            session.add(post_type_obj)

    session.commit()