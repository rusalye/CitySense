from pydantic import BaseModel
from typing import Optional

class Card(BaseModel):
    id: Optional[str] = None
    emoji: str
    name: str
    set: str
    rarity: str
    collected: bool
