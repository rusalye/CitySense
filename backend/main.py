from fastapi import FastAPI
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
import certifi

load_dotenv()

app = FastAPI()

MONGODB_URL = os.getenv("MONGODB_URL")

client = AsyncIOMotorClient(
    MONGODB_URL,
    tlsCAFile=certifi.where()
)

db = client["citysense_db"]

@app.get("/")
async def root():
    try:
        await client.admin.command("ping")
        return {"message": "Database Connected Successfully"}
    except Exception as e:
        return {"error": str(e)}

@app.get("/zones")
async def get_zones():
    zones = []
    async for zone in db.zones.find():
        zone["_id"] = str(zone["_id"])
        zones.append(zone)
    return zones
