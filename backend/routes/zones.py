from fastapi import APIRouter, Request
from typing import List
from models.zone_model import Zone

router = APIRouter()

def get_db(request: Request):
    return request.app.state.db

@router.get("/", response_model=List[Zone])
async def fetch_zones(request: Request):
    db = get_db(request)
    zones = []
    async for zone in db.zones.find():
        zone["id"] = str(zone["_id"])
        zones.append(zone)
    return zones
