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

class UserUpdate(BaseModel):
    name: Optional[str] = None
    username: Optional[str] = None
    age: Optional[int] = None
    age_group: Optional[str] = None  # "teen", "adult", "senior"
    phone: Optional[str] = None

class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str

class User(BaseModel):
    id: Optional[str] = None
    email: EmailStr
    name: str = "New Voyager"
    username: str = "voyager"
    age: Optional[int] = None
    age_group: Optional[str] = None  # "teen", "adult", "senior"
    phone: Optional[str] = None
    initial: str = "V"
    level: int = 1
    rank: str = "Novice"
    xp: int = 0
    xpNext: int = 1000
    daysActive: int = 1
    placesVisited: int = 0
    cardsCollected: int = 0
    challengesCompleted: int = 0
