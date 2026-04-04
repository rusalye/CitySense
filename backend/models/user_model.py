from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: Optional[str] = None
    email: EmailStr
    name: str = "New Voyager"
    initial: str = "V"
    level: int = 1
    rank: str = "Novice"
    xp: int = 0
