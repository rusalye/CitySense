from fastapi import APIRouter, Request
from typing import List
from models.journal_model import JournalEntry

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
        
    res = await db.journals.insert_one(new_entry)
    new_entry["id"] = str(res.inserted_id)
    return new_entry
