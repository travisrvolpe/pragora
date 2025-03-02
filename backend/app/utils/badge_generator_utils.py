# utils/badge_generator.py
from PIL import Image, ImageDraw, ImageFont
import os
from pathlib import Path


def generate_badge_icon(category_name, threshold, is_merit, output_dir="static/badges"):
    """
    Generate a simple badge icon

    Args:
        category_name: Name of the badge category (e.g., "Logical Reasoning")
        threshold: Point threshold for this badge level (e.g., 10, 100)
        is_merit: Whether this is a merit badge (True) or demerit badge (False)
        output_dir: Directory to save generated badge icons

    Returns:
        str: Path to the generated badge icon
    """
    # Set colors based on merit/demerit
    if is_merit:
        bg_color = (50, 150, 50)  # Green for merits
        border_color = (30, 120, 30)  # Darker green for border
    else:
        bg_color = (150, 50, 50)  # Red for demerits
        border_color = (120, 30, 30)  # Darker red for border

    # Create base image (transparent background)
    img = Image.new('RGBA', (200, 200), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)

    # Draw badge shape with border
    draw.ellipse((5, 5, 195, 195), fill=border_color)  # Outer circle (border)
    draw.ellipse((10, 10, 190, 190), fill=bg_color)  # Main circle
    draw.ellipse((30, 30, 170, 170), fill=(255, 255, 255))  # Inner white circle

    # Try to load a nice font, fall back to default if not available
    try:
        # Try common fonts that might be available
        for font_name in ['arial.ttf', 'Arial.ttf', 'DejaVuSans.ttf', 'Roboto-Regular.ttf']:
            try:
                title_font = ImageFont.truetype(font_name, 32)
                number_font = ImageFont.truetype(font_name, 40)
                break
            except OSError:
                continue
        else:
            raise OSError("No suitable fonts found")
    except:
        # Fall back to default font if none available
        title_font = ImageFont.load_default()
        number_font = ImageFont.load_default()

    # Format category name for display (first letter or abbreviation)
    if "_" in category_name:
        # If name has multiple words with underscores, use first letter of each word
        display_text = "".join(word[0].upper() for word in category_name.split("_"))
    else:
        # Otherwise just use the first letter
        display_text = category_name[0].upper()

    # Draw text - position may need adjustment based on font
    # For newer Pillow versions with anchor support
    try:
        draw.text((100, 70), display_text, font=title_font, fill=bg_color, anchor="mm")
        draw.text((100, 130), str(threshold), font=number_font, fill=bg_color, anchor="mm")
    except TypeError:
        # Fallback for older Pillow versions without anchor support
        title_bbox = title_font.getbbox(display_text)
        title_width = title_bbox[2] - title_bbox[0]
        title_height = title_bbox[3] - title_bbox[1]
        draw.text((100 - title_width / 2, 70 - title_height / 2), display_text, font=title_font, fill=bg_color)

        number_bbox = number_font.getbbox(str(threshold))
        number_width = number_bbox[2] - number_bbox[0]
        number_height = number_bbox[3] - number_bbox[1]
        draw.text((100 - number_width / 2, 130 - number_height / 2), str(threshold), font=number_font, fill=bg_color)

    # Create directory if it doesn't exist
    Path(output_dir).mkdir(parents=True, exist_ok=True)

    # Generate filename
    category_slug = category_name.lower().replace(" ", "_")
    badge_type = "merit" if is_merit else "demerit"
    filename = f"{output_dir}/{badge_type}_{category_slug}_{threshold}.png"

    # Save the image
    img.save(filename)

    # Return the path relative to the static directory
    return filename


def generate_all_badge_icons(categories, thresholds=[1, 10, 25, 100, 250, 1000, 2500], output_dir="static/badges"):
    """
    Generate all badge icons for the given categories and thresholds

    Args:
        categories: List of (category_name, is_merit) tuples
        thresholds: List of point thresholds for badge levels
        output_dir: Directory to save generated badge icons

    Returns:
        dict: Mapping of category/threshold to generated icon paths
    """
    result = {}

    for category_name, is_merit in categories:
        category_icons = {}
        for threshold in thresholds:
            icon_path = generate_badge_icon(category_name, threshold, is_merit, output_dir)
            category_icons[threshold] = icon_path

        result[category_name] = category_icons

    return result


if __name__ == "__main__":
    # Example usage
    merit_categories = [
        "Logical_Reasoning",
        "Evidence_Quality",
        "Good_Faith_Participation",
        "Practical_Solutions",
        "Community_Contribution"
    ]

    demerit_categories = [
        "Logical_Fallacies",
        "Bad_Faith_Behavior",
        "Misinformation",
        "Unhelpful_Contributions"
    ]

    # Generate all merit badge icons
    for category in merit_categories:
        generate_all_badge_icons([(category, True)])

    # Generate all demerit badge icons
    for category in demerit_categories:
        generate_all_badge_icons([(category, False)])

    print("✅ All badge icons generated successfully")