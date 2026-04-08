from fastapi import APIRouter, HTTPException, Request
from models.user_model import UserCreate, UserLogin, User
import hashlib

router = APIRouter()

def get_db(request: Request):
    return request.app.state.db

def hash_pass(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

@router.post("/register", response_model=User)
async def register(user: UserCreate, request: Request):
    db = get_db(request)
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = {
        "email": user.email,
        "password_hash": hash_pass(user.password),
        "name": user.name,
        "username": user.username,
        "age": user.age,
        "phone": user.phone,
        "initial": user.name[0].upper() if user.name else "V",
        "level": 1,
        "rank": "Novice",
        "xp": 0
    }
    result = await db.users.insert_one(new_user)
    new_user["id"] = str(result.inserted_id)
    return new_user

@router.post("/login", response_model=User)
async def login(user: UserLogin, request: Request):
    db = get_db(request)
    existing = await db.users.find_one({"email": user.email})
    if not existing:
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    if existing["password_hash"] != hash_pass(user.password):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    existing["id"] = str(existing["_id"])
    return existing
