from fastapi import APIRouter, HTTPException, Request, UploadFile, File, Form
from models.post_model import PostCreate, Post
from typing import List
from bson import ObjectId
from datetime import datetime
import os
import uuid

router = APIRouter()


# ── Helpers ────────────────────────────────────────────────────────────────────

def get_db(request: Request):
    return request.app.state.db


async def verify_user(user_id: str, db) -> dict:
    """
    Confirm that user_id is a valid ObjectId and that the user exists in the DB.
    Raises 400 for a malformed ID and 401 if the user is not found.
    Returns the user document on success.
    """
    try:
        obj_user_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    user = await db.users.find_one({"_id": obj_user_id})
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized: user not found")

    return user


def serialize_post(post: dict) -> dict:
    """Convert MongoDB document to API-safe dict."""
    post["id"] = str(post["_id"])
    post["user_id"] = str(post["user_id"])
    del post["_id"]
    return post


# ── Write endpoints (authentication required) ─────────────────────────────────

@router.post("/posts", response_model=Post)
async def create_post(
    request: Request,
    user_id: str = Form(...),
    username: str = Form(...),
    chapter_id: str = Form(...),
    text: str = Form(...),
    location: str = Form(None),
    image: UploadFile = File(None),
):
    db = get_db(request)
    await verify_user(user_id, db)   # ← auth check

    # Validate required fields are not empty/whitespace
    if not username or not username.strip():
        raise HTTPException(status_code=400, detail="Username cannot be empty")
    
    if not chapter_id or not chapter_id.strip():
        raise HTTPException(status_code=400, detail="Chapter ID cannot be empty")
    
    if not text or not text.strip():
        raise HTTPException(status_code=400, detail="Post content cannot be empty")
    
    # Trim whitespace from text fields
    username = username.strip()
    chapter_id = chapter_id.strip()
    text = text.strip()
    if location:
        location = location.strip() if location else None

    ALLOWED_TYPES = {
        "image/jpeg": ".jpg",
        "image/png":  ".png",
        "image/gif":  ".gif",
        "image/webp": ".webp",
    }

    image_url = None
    if image and image.filename:
        if image.content_type not in ALLOWED_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type '{image.content_type}'. Allowed: jpeg, png, gif, webp.",
            )

        os.makedirs("uploads", exist_ok=True)
        # Use content_type-derived extension — safe, lowercase, independent of client filename
        ext = ALLOWED_TYPES[image.content_type]          # e.g. ".jpg"
        filename = f"{uuid.uuid4().hex}{ext}"            # e.g. "a3f...d9.jpg"
        filepath = os.path.join("uploads", filename)

        contents = await image.read()
        with open(filepath, "wb") as f:
            f.write(contents)

        image_url = f"/uploads/{filename}"

    new_post = {
        "user_id": ObjectId(user_id),
        "username": username,
        "chapter_id": chapter_id,
        "text": text,
        "location": location,
        "image_url": image_url,
        "created_at": datetime.now(),
        "updated_at": None,
        "likes": 0,
        "likedBy": [],
    }

    result = await db.posts.insert_one(new_post)
    # new_post now has _id injected by Motor — use serialize_post to clean it
    return serialize_post(new_post)


@router.put("/posts/{post_id}", response_model=Post)
async def update_post(
    post_id: str,
    request: Request,
    user_id: str = Form(...),
    text: str = Form(None),
    location: str = Form(None),
):
    db = get_db(request)
    await verify_user(user_id, db)   # ← auth check

    try:
        obj_id = ObjectId(post_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid post ID")

    update_dict = {}
    if text:
        update_dict["text"] = text
    if location is not None:
        update_dict["location"] = location

    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields to update")

    update_dict["updated_at"] = datetime.now()

    result = await db.posts.find_one_and_update(
        {"_id": obj_id},
        {"$set": update_dict},
        return_document=True,
    )

    if not result:
        raise HTTPException(status_code=404, detail="Post not found")

    return serialize_post(result)


@router.delete("/posts/{post_id}")
async def delete_post(
    post_id: str,
    request: Request,
    user_id: str = Form(...),
):
    db = get_db(request)
    await verify_user(user_id, db)   # ← auth check

    try:
        obj_id = ObjectId(post_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid post ID")

    post = await db.posts.find_one({"_id": obj_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if str(post["user_id"]) != user_id:
        raise HTTPException(
            status_code=403, detail="Only the post owner can delete this post"
        )

    # Delete associated image file if it exists
    if post.get("image_url"):
        try:
            # Extract filename from image_url (e.g., "/uploads/abc123.jpg" -> "abc123.jpg")
            image_filename = post["image_url"].split("/")[-1]
            image_path = os.path.join("uploads", image_filename)
            
            # Remove file if it exists
            if os.path.exists(image_path):
                os.remove(image_path)
        except Exception as e:
            # Log error but don't fail the delete operation
            print(f"Warning: Could not delete image file: {e}")

    result = await db.posts.delete_one({"_id": obj_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")

    return {"message": "Post deleted successfully"}


@router.put("/posts/{post_id}/like", response_model=Post)
async def like_post(
    post_id: str,
    request: Request,
    user_id: str = Form(...),
):
    db = get_db(request)
    await verify_user(user_id, db)   # ← auth check

    try:
        obj_id = ObjectId(post_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid post ID")

    post = await db.posts.find_one({"_id": obj_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Initialize likedBy array if it doesn't exist
    liked_by = post.get("likedBy", []) or []
    
    # Check if user has already liked this post
    if user_id in liked_by:
        # Remove like (unlike)
        liked_by.remove(user_id)
        update_op = {
            "$set": {"likedBy": liked_by},
            "$inc": {"likes": -1},
        }
        action = "unliked"
    else:
        # Add like
        liked_by.append(user_id)
        update_op = {
            "$set": {"likedBy": liked_by},
            "$inc": {"likes": 1},
        }
        action = "liked"
    
    result = await db.posts.find_one_and_update(
        {"_id": obj_id},
        update_op,
        return_document=True,
    )

    if not result:
        raise HTTPException(status_code=404, detail="Post not found")

    return serialize_post(result)


# ── Read endpoints (no authentication required) ───────────────────────────────

@router.get("/posts/chapter/{chapter_id}", response_model=List[Post])
async def get_posts_by_chapter(chapter_id: str, request: Request, skip: int = 0, limit: int = 50):
    db = get_db(request)

    if not chapter_id or not chapter_id.strip():
        raise HTTPException(status_code=400, detail="Invalid chapter ID")
    
    # Validate pagination parameters
    if skip < 0:
        raise HTTPException(status_code=400, detail="skip must be non-negative")
    if limit < 1 or limit > 100:
        raise HTTPException(status_code=400, detail="limit must be between 1 and 100")

    posts = (
        await db.posts.find({"chapter_id": chapter_id})
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
        .to_list(None)
    )

    return [serialize_post(p) for p in posts]


@router.get("/posts", response_model=List[Post])
async def get_all_posts(request: Request, skip: int = 0, limit: int = 50):
    db = get_db(request)
    
    # Validate pagination parameters
    if skip < 0:
        raise HTTPException(status_code=400, detail="skip must be non-negative")
    if limit < 1 or limit > 100:
        raise HTTPException(status_code=400, detail="limit must be between 1 and 100")
    
    posts = (
        await db.posts.find({})
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
        .to_list(None)
    )
    return [serialize_post(p) for p in posts]


@router.get("/posts/{post_id}", response_model=Post)
async def get_post(post_id: str, request: Request):
    db = get_db(request)

    try:
        obj_id = ObjectId(post_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid post ID")

    post = await db.posts.find_one({"_id": obj_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    return serialize_post(post)
