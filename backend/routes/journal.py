from fastapi import APIRouter, Request, File, UploadFile, Form
from typing import List, Optional
from models.journal_model import JournalEntry
import os
from datetime import datetime

router = APIRouter()

def get_db(request: Request):
    return request.app.state.db

@router.get("/", response_model=List[JournalEntry])
async def fetch_journal(request: Request):
    db = get_db(request)
    entries = []
    async for entry in db.journals.find():
        entry["id"] = str(entry["_id"])
        entries.append(entry)
    return entries

@router.post("/", response_model=JournalEntry)
async def create_journal(entry: JournalEntry, request: Request):
    db = get_db(request)
    new_entry = dict(entry)
    if "id" in new_entry:
        del new_entry["id"]
    
    # Ensure images is initialized
    if new_entry.get("images") is None:
        new_entry["images"] = []
        
    res = await db.journals.insert_one(new_entry)
    new_entry["id"] = str(res.inserted_id)
    return new_entry

@router.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    """Upload an image and return its path for storing in journal entry"""
    try:
        # Create uploads directory if it doesn't exist
        os.makedirs("uploads", exist_ok=True)
        
        # Generate unique filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_")
        filename = timestamp + file.filename
        filepath = os.path.join("uploads", filename)
        
        # Save file
        with open(filepath, "wb") as buffer:
            contents = await file.read()
            buffer.write(contents)
        
        # Return the relative path to store in database
        return {"success": True, "imagePath": filepath}
    except Exception as e:
        return {"success": False, "error": str(e)}
