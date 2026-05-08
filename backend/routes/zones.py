from fastapi import APIRouter, Request
from typing import List, Optional
from models.zone_model import Zone

router = APIRouter()

def get_db(request: Request):
    return request.app.state.db

@router.get("/", response_model=List[Zone])
async def fetch_zones(
    request: Request, 
    chapter_id: Optional[str] = None,
    mode: Optional[str] = None,
    age_group: Optional[str] = None
):
    """
    Fetch zones with optional filtering and age-aware sorting.
    
    Parameters:
    - chapter_id: Filter by specific chapter (optional)
    - mode: Filter by mode ('calm', 'comfort', 'explore') (optional)
    - age_group: Sort by age preferences ('teen', 'adult', 'senior') (optional)
    
    Returns:
    - List of zones, optionally filtered by mode and sorted by age preference
    """
    db = get_db(request)
    zones = []
    query = {}
    
    # Build query filters
    if chapter_id:
        query["chapter_id"] = chapter_id
    if mode:
        query["mode"] = mode
        
    # Fetch zones from database
    async for zone in db.zones.find(query):
        zone["id"] = str(zone["_id"])
        zones.append(zone)
    
    # Sort by age_group preferences if provided
    if age_group and age_group in ["teen", "adult", "senior"]:
        zones.sort(
            key=lambda z: z.get("age_preferences", {}).get(age_group, 50),
            reverse=True  # Higher scores ranked first
        )
    
    return zones
