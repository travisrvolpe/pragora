from sqlalchemy.orm import Session
from app.datamodels.post_datamodels import Post

def seed_posts(session: Session):
    example_posts = [
        {
            "user_id": 1,
            "title": "The Benefits of AI in Everyday Life",
            "subtitle": "Exploring the impact of AI on modern society",
            "type": "article",
            "content": "AI has become an integral part of our lives...",
            "category_id": 4,  # Science & Technology
            "subcategory_id": 9,  # AI
            "custom_subcategory": None,
            "tags": "AI, Technology, Innovation"
        },
        {
            "user_id": 2,
            "title": "Gardening Tips for Beginners",
            "subtitle": "Learn how to start your first garden",
            "type": "article",
            "content": "Gardening can be a relaxing and rewarding hobby...",
            "category_id": 2,  # Home & Habitat
            "subcategory_id": 6,  # Gardening
            "custom_subcategory": None,
            "tags": "Gardening, Home, Tips"
        }
    ]

    for post_data in example_posts:
        post = Post(**post_data)
        session.add(post)

    session.commit()
