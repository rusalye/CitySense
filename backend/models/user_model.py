from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    age: int
    phone: str
    username: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: Optional[str] = None
    email: EmailStr
    name: str = "New Voyager"
    username: str = "voyager"
    age: Optional[int] = None
    phone: Optional[str] = None
    initial: str = "V"
    level: int = 1
    rank: str = "Novice"
    xp: int = 0
