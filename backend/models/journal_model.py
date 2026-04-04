from pydantic import BaseModel
from typing import List, Optional

class JournalEntry(BaseModel):
    id: Optional[str] = None
    date: str
    title: str
    body: str
    tags: List[str]
    steps: str
    duration: str
    mood: str
    moodColor: str
