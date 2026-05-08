from fastapi import APIRouter, HTTPException, Request
from models.user_model import UserCreate, UserLogin, User, UserUpdate, PasswordUpdate
import hashlib

router = APIRouter()

def get_db(request: Request):
    return request.app.state.db

def hash_pass(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def get_age_group(age: int) -> str:
    """Determine age group from numeric age"""
    if age < 18:
        return "teen"
    elif age < 60:
        return "adult"
    else:
        return "senior"

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
        "age_group": get_age_group(user.age),
        "phone": user.phone,
        "initial": user.name[0].upper() if user.name else "V",
        "level": 1,
        "rank": "Novice",
        "xp": 0,
        "xpNext": 1000,
        "daysActive": 1,
        "placesVisited": 0,
        "cardsCollected": 0,
        "challengesCompleted": 0
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
    
    # Ensure age_group is set (for backward compatibility)
    if "age" in existing and "age_group" not in existing:
        existing["age_group"] = get_age_group(existing["age"])
    
    existing["id"] = str(existing["_id"])
    return existing

from bson import ObjectId

@router.put("/{user_id}/profile", response_model=User)
async def update_profile(user_id: str, update_data: UserUpdate, request: Request):
    db = get_db(request)
    try:
        obj_id = ObjectId(user_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID")
        
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    
    if "name" in update_dict and update_dict["name"]:
        update_dict["initial"] = update_dict["name"][0].upper()
    
    # Auto-calculate age_group if age is being updated
    if "age" in update_dict:
        update_dict["age_group"] = get_age_group(update_dict["age"])
        
    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields to update")
        
    result = await db.users.find_one_and_update(
        {"_id": obj_id},
        {"$set": update_dict},
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="User not found")
        
    result["id"] = str(result["_id"])
    return result

@router.put("/{user_id}/password")
async def update_password(user_id: str, pass_data: PasswordUpdate, request: Request):
    db = get_db(request)
    try:
        obj_id = ObjectId(user_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID")
        
    user = await db.users.find_one({"_id": obj_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user["password_hash"] != hash_pass(pass_data.current_password):
        raise HTTPException(status_code=400, detail="Invalid current password")
        
    await db.users.update_one(
        {"_id": obj_id},
        {"$set": {"password_hash": hash_pass(pass_data.new_password)}}
    )
    
    return {"message": "Password updated successfully"}
