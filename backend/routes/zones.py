from fastapi import APIRouter, Request
from typing import List, Optional
from models.zone_model import Zone

router = APIRouter()

def get_db(request: Request):
    return request.app.state.db

@router.get("/", response_model=List[Zone])
async def fetch_zones(request: Request, chapter_id: Optional[str] = None):
    db = get_db(request)
    zones = []
    query = {}
    if chapter_id:
        query["chapter_id"] = chapter_id
        
    async for zone in db.zones.find(query):
        zone["id"] = str(zone["_id"])
        zones.append(zone)
    return zones
