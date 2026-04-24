from pydantic import BaseModel
from typing import Optional

class Zone(BaseModel):
    id: Optional[str] = None
    title: Optional[str] = None
    emoji: str
    sub: Optional[str] = None
    dist: Optional[str] = None
    rating: Optional[str] = None
    mode: Optional[str] = None
    bg: Optional[str] = None
    badge: Optional[str] = None
    badgeTxt: Optional[str] = None
    lat: float
    lng: float
    type: str # 'discover', 'popular', 'mapOnly', etc.
    color: Optional[str] = None
    chapter_id: Optional[str] = None
    card_name: Optional[str] = None
    image_url: Optional[str] = None
    description: Optional[str] = None
