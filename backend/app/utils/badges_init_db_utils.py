# utils/badges_init_db_utils.py
from app.datamodels.badge_datamodels import BadgeCategory, Badge
from database.database import SessionLocal
from .badge_generator_utils import generate_badge_icon
import logging

logger = logging.getLogger(__name__)

# Define standard thresholds for badge levels
STANDARD_THRESHOLDS = [1, 10, 25, 100, 250, 1000, 2500]

# Define badge configurations
MERIT_CATEGORIES = [
    {
        "badge_name": "Logical Reasoning",
        "badge_description": "Demonstrating sound logical arguments and reasoning",
        "badges": [
            {"badge_name": "Logic Novice", "badge_threshold": 1},
            {"badge_name": "Logic Apprentice", "badge_threshold": 10},
            {"badge_name": "Logic Adept", "badge_threshold": 25},
            {"badge_name": "Logic Expert", "badge_threshold": 100},
            {"badge_name": "Logic Master", "badge_threshold": 250},
            {"badge_name": "Logic Grandmaster", "badge_threshold": 1000},
            {"badge_name": "Logic Sage", "badge_threshold": 2500},
        ]
    },
    {
        "badge_name": "Evidence Quality",
        "badge_description": "Providing high-quality evidence for claims",
        "badges": [
            {"badge_name": "Evidence Collector", "badge_threshold": 1},
            {"badge_name": "Evidence Gatherer", "badge_threshold": 10},
            {"badge_name": "Evidence Analyst", "badge_threshold": 25},
            {"badge_name": "Evidence Expert", "badge_threshold": 100},
            {"badge_name": "Evidence Master", "badge_threshold": 250},
            {"badge_name": "Evidence Authority", "badge_threshold": 1000},
            {"badge_name": "Evidence Scholar", "badge_threshold": 2500},
        ]
    },
    {
        "badge_name": "Good Faith Participation",
        "badge_description": "Consistently engaging in good faith discussions",
        "badges": [
            {"badge_name": "Good Faith Beginner", "badge_threshold": 1},
            {"badge_name": "Good Faith Member", "badge_threshold": 10},
            {"badge_name": "Good Faith Contributor", "badge_threshold": 25},
            {"badge_name": "Good Faith Exemplar", "badge_threshold": 100},
            {"badge_name": "Good Faith Paragon", "badge_threshold": 250},
            {"badge_name": "Good Faith Champion", "badge_threshold": 1000},
            {"badge_name": "Good Faith Luminary", "badge_threshold": 2500},
        ]
    },
    {
        "badge_name": "Practical Solutions",
        "badge_description": "Providing actionable and practical solutions",
        "badges": [
            {"badge_name": "Solution Finder", "badge_threshold": 1},
            {"badge_name": "Solution Provider", "badge_threshold": 10},
            {"badge_name": "Solution Crafter", "badge_threshold": 25},
            {"badge_name": "Solution Expert", "badge_threshold": 100},
            {"badge_name": "Solution Master", "badge_threshold": 250},
            {"badge_name": "Solution Architect", "badge_threshold": 1000},
            {"badge_name": "Solution Visionary", "badge_threshold": 2500},
        ]
    },
    {
        "badge_name": "Community Contribution",
        "badge_description": "Contributing valuable notes and feedback",
        "badges": [
            {"badge_name": "Community Helper", "badge_threshold": 1},
            {"badge_name": "Community Contributor", "badge_threshold": 10},
            {"badge_name": "Community Pillar", "badge_threshold": 25},
            {"badge_name": "Community Guide", "badge_threshold": 100},
            {"badge_name": "Community Leader", "badge_threshold": 250},
            {"badge_name": "Community Ambassador", "badge_threshold": 1000},
            {"badge_name": "Community Luminary", "badge_threshold": 2500},
        ]
    }
]

DEMERIT_CATEGORIES = [
    {
        "badge_name": "Logical Fallacies",
        "badge_description": "Instances of logical fallacies in arguments",
        "badges": [
            {"badge_name": "Fallacy Novice", "badge_threshold": 1},
            {"badge_name": "Fallacy Apprentice", "badge_threshold": 10},
            {"badge_name": "Fallacy Adept", "badge_threshold": 25},
            {"badge_name": "Fallacy Expert", "badge_threshold": 100},
            {"badge_name": "Fallacy Master", "badge_threshold": 250},
            {"badge_name": "Fallacy Grandmaster", "badge_threshold": 1000},
            {"badge_name": "Fallacy Sage", "badge_threshold": 2500},
        ]
    },
    {
        "badge_name": "Bad Faith Behavior",
        "badge_description": "Instances of trolling or bad faith participation",
        "badges": [
            {"badge_name": "Troll Apprentice", "badge_threshold": 1},
            {"badge_name": "Troll Journeyman", "badge_threshold": 10},
            {"badge_name": "Troll Adept", "badge_threshold": 25},
            {"badge_name": "Troll Expert", "badge_threshold": 100},
            {"badge_name": "Troll Master", "badge_threshold": 250},
            {"badge_name": "Troll Grandmaster", "badge_threshold": 1000},
            {"badge_name": "Troll Sage", "badge_threshold": 2500},
        ]
    },
    {
        "badge_name": "Misinformation",
        "badge_description": "Instances of spreading inaccurate information",
        "badges": [
            {"badge_name": "Misinformation Novice", "badge_threshold": 1},
            {"badge_name": "Misinformation Carrier", "badge_threshold": 10},
            {"badge_name": "Misinformation Spreader", "badge_threshold": 25},
            {"badge_name": "Misinformation Expert", "badge_threshold": 100},
            {"badge_name": "Misinformation Master", "badge_threshold": 250},
            {"badge_name": "Misinformation Grandmaster", "badge_threshold": 1000},
            {"badge_name": "Misinformation Sage", "badge_threshold": 2500},
        ]
    },
    {
        "badge_name": "Unhelpful Contributions",
        "badge_description": "Posts with minimal actionability or practical value",
        "badges": [
            {"badge_name": "Unhelpful Novice", "badge_threshold": 1},
            {"badge_name": "Unhelpful Commenter", "badge_threshold": 10},
            {"badge_name": "Unhelpful Regular", "badge_threshold": 25},
            {"badge_name": "Unhelpful Expert", "badge_threshold": 100},
            {"badge_name": "Unhelpful Master", "badge_threshold": 250},
            {"badge_name": "Unhelpful Grandmaster", "badge_threshold": 1000},
            {"badge_name": "Unhelpful Sage", "badge_threshold": 2500},
        ]
    }
]


async def init_badges(generate_icons=True, output_dir="static/badges"):
    """
    Initialize badge categories and badge levels in the database

    Args:
        generate_icons: Whether to generate badge icons
        output_dir: Directory to save generated badge icons
    """
    db = SessionLocal()
    try:
        # Process merit categories
        await _process_badge_categories(db, MERIT_CATEGORIES, True, generate_icons, output_dir)

        # Process demerit categories
        await _process_badge_categories(db, DEMERIT_CATEGORIES, False, generate_icons, output_dir)

        db.commit()
        logger.info("✅ Badges initialized successfully")
        print("✅ Badges initialized successfully")

    except Exception as e:
        db.rollback()
        logger.error(f"❌ Error initializing badges: {str(e)}")
        print(f"❌ Error initializing badges: {str(e)}")
    finally:
        db.close()


async def _process_badge_categories(db, categories, is_merit, generate_icons, output_dir):
    """
    Process a list of badge categories and their badges

    Args:
        db: Database session
        categories: List of category configurations
        is_merit: Whether these are merit badges
        generate_icons: Whether to generate badge icons
        output_dir: Directory to save generated badge icons
    """
    for category_data in categories:
        # Check if category exists
        category = db.query(BadgeCategory).filter_by(badge_name=category_data["badge_name"]).first()

        # Create category if it doesn't exist
        if not category:
            category = BadgeCategory(
                badge_name=category_data["badge_name"],
                badge_description=category_data["badge_description"],
                is_merit=is_merit
            )
            db.add(category)
            db.flush()  # Get the ID

            # Create badges for this category
            for badge_data in category_data["badges"]:
                category_slug = category_data["badge_name"].lower().replace(" ", "_")
                badge_type = "merit" if is_merit else "demerit"
                icon_path = f"/badges/{badge_type}_{category_slug}_{badge_data['badge_threshold']}.png"

                # Generate icon if requested
                if generate_icons:
                    try:
                        generate_badge_icon(
                            category_data["badge_name"],
                            badge_data["badge_threshold"],
                            is_merit,
                            output_dir
                        )
                    except Exception as e:
                        logger.warning(f"Could not generate icon for {badge_data['badge_name']}: {str(e)}")

                # Create badge in database
                badge = Badge(
                    badge_category_id=category.badge_category_id,
                    badge_name=badge_data["badge_name"],
                    badge_description=f"Earned for {badge_data['badge_threshold']} points in {category_data['badge_name']}",
                    badge_icon_url=icon_path,
                    badge_threshold=badge_data["badge_threshold"],
                    is_merit=is_merit
                )
                db.add(badge)


if __name__ == "__main__":
    # Can be run directly for testing
    import asyncio

    asyncio.run(init_badges())