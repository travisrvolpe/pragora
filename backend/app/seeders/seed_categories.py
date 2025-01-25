from sqlalchemy.orm import Session
from datamodels import Category, Subcategory

categories_data = [
    {"name": "Self-Development", "subcategories": ["Health & Wellness", "Personal Growth", "Skill Development"]},
    {"name": "Home & Habitat", "subcategories": ["Home Design", "Gardening"]},
    {"name": "Nature & Environment", "subcategories": ["Sustainability", "Conservation"]},
    {"name": "Science & Technology", "subcategories": ["Engineering", "AI"]},
    {"name": "Philosophy", "subcategories": ["Ethics", "Metaphysics"]},
    {"name": "Economics & Business", "subcategories": ["Finance", "Entrepreneurship"]},
    {"name": "Society & Culture", "subcategories": ["Politics", "History"]},
    {"name": "Civic Engagement", "subcategories": ["Volunteerism", "Governance"]},
    {"name": "Entertainment", "subcategories": ["Pop Culture", "Media"]},
    {"name": "Miscellaneous", "subcategories": []},
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
