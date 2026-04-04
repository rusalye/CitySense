from fastapi import APIRouter, Request
from typing import List
from models.chapter_model import City

router = APIRouter()

def get_db(request: Request):
    return request.app.state.db

@router.get("/", response_model=List[City])
async def fetch_chapters(request: Request):
    db = get_db(request)
    cities = []
    async for city in db.chapters.find():
        city["id"] = str(city["_id"])
        if "chapters" in city:
            for ch in city["chapters"]:
                ch["id"] = str(ch.get("id", ch.get("_id", "")))
        cities.append(city)
    return cities
