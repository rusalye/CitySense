from fastapi import APIRouter, Request
from typing import List
from models.challenge_model import Challenge

router = APIRouter()

def get_db(request: Request):
    return request.app.state.db

@router.get("/", response_model=List[Challenge])
async def fetch_challenges(request: Request):
    db = get_db(request)
    challenges = []
    async for ch in db.challenges.find():
        ch["id"] = str(ch["_id"])
        challenges.append(ch)
    return challenges
