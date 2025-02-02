# app/services/file_service.py
# At some point movie upload_post_image / video to here?

import os
import uuid
from fastapi import UploadFile
from PIL import Image
import aiofiles

UPLOAD_DIR = "media/avatars"  # Define upload directory

# Ensure upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)


async def save_avatar_image(file: UploadFile) -> str:
    """
    Save an avatar image and return the file path.
    """
    # Generate unique filename
    file_extension = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{file_extension}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    # Ensure the file is an image
    if file.content_type not in ["image/jpeg", "image/png", "image/gif"]:
        raise ValueError("File must be an image (JPEG, PNG, or GIF)")

    # Save the file
    async with aiofiles.open(filepath, 'wb') as out_file:
        content = await file.read()
        await out_file.write(content)

    # Process image (resize if needed)
    with Image.open(filepath) as img:
        # Resize image to standard size for avatars (e.g., 200x200)
        img.thumbnail((200, 200))
        img.save(filepath)

    # Return the relative path for storage in database
    return f"/avatars/{filename}"


#async def upload_post_image(file: UploadFile, post_id: int, db: Session):
#    ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}
#    file_extension = file.filename.split(".")[-1].lower()

#    if file_extension not in ALLOWED_EXTENSIONS:
#        raise HTTPException(status_code=400, detail="Unsupported file type")

    # Save the file locally
#    save_path = f"./media/posts/{post_id}.{file_extension}"
#    with open(save_path, "wb") as buffer:
#        buffer.write(await file.read())

    # Update the post in the database
#    post = db.query(Post).filter(Post.post_id == post_id).first()
#    if not post:
#        raise HTTPException(status_code=404, detail="Post not found")

#    post.image_url = save_path
#    db.commit()
#    db.refresh(post)

#    return {"message": "Image uploaded successfully", "image_url": save_path}

