from fastapi import APIRouter, Request
from typing import List
from models.card_model import Card

router = APIRouter()

def get_db(request: Request):
    return request.app.state.db

@router.get("/", response_model=List[Card])
async def fetch_cards(request: Request):
    db = get_db(request)
    cards = []
    async for card in db.cards.find():
        card["id"] = str(card["_id"])
        cards.append(card)
    return cards
