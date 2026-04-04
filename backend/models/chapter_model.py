from pydantic import BaseModel
from typing import List, Optional

class Stop(BaseModel):
    name: str

class Chapter(BaseModel):
    id: str
    num: str
    area: str
    emoji: str
    theme: str
    desc: str
    stops: List[str]
    stopsVisited: int
    stopsTotal: int
    progress: int
    color: str
    colorHex: str
    status: str # 'active', 'complete', 'locked'
    xp: int
    card: str

class City(BaseModel):
    id: str
    name: str
    country: str
    emoji: str
    tagline: str
    color: str
    colorHex: str
    userHere: bool
    chaptersUnlocked: int
    chaptersTotal: int
    comingSoon: Optional[bool] = False
    chapters: List[Chapter] = []
