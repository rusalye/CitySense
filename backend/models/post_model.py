from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class PostCreate(BaseModel):
    chapter_id: str
    text: str
    location: Optional[str] = None
    image_url: Optional[str] = None

class Post(BaseModel):
    id: Optional[str] = None
    user_id: str
    username: str
    chapter_id: str
    text: str
    location: Optional[str] = None
    image_url: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    likes: int = 0
    likedBy: Optional[List[str]] = None  # List of user IDs who liked this post
