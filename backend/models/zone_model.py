from pydantic import BaseModel
from typing import Optional, Dict, List

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
    age_preferences: Optional[Dict[str, int]] = None  # {"teen": 70, "adult": 80, "senior": 85}
    popularity_score: Optional[float] = None  # How "known" vs "hidden gem" (0-100)
    quality_score: Optional[float] = None  # How good a recommendation this place is (0-100)
    experience_tags: Optional[List[str]] = None  # ["social", "quiet", "scenic", "walkable", "youthful", "cultural", "heritage", "accessible", "work-friendly", "nightlife", "cozy", "active"]
