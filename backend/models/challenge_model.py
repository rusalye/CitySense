from pydantic import BaseModel
from typing import Optional

class Challenge(BaseModel):
    id: str
    icon: str
    title: str
    desc: str
    reward: str
    progress: int
    total: int
    color: str
    type: str # 'active', 'completed'
    daily: bool
