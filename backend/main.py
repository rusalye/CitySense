from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
import certifi

from routes import users, zones, chapters, challenges, cards, journal, environment, community

load_dotenv()

app = FastAPI()

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGODB_URL = os.getenv("MONGODB_URL")

client = AsyncIOMotorClient(
    MONGODB_URL,
    tlsCAFile=certifi.where()
)

db = client["citysense_db"]
app.state.db = db

# Include routers
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(zones.router, prefix="/zones", tags=["zones"])
app.include_router(chapters.router, prefix="/chapters", tags=["chapters"])
app.include_router(challenges.router, prefix="/challenges", tags=["challenges"])
app.include_router(cards.router, prefix="/cards", tags=["cards"])
app.include_router(journal.router, prefix="/journal", tags=["journal"])
app.include_router(environment.router, prefix="/environment", tags=["environment"])
app.include_router(community.router, prefix="/community", tags=["community"])

from fastapi.staticfiles import StaticFiles

# Ensure uploads directory exists before mounting (StaticFiles crashes if missing)
os.makedirs("uploads", exist_ok=True)

# Serve uploaded files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
async def root():
    try:
        await client.admin.command("ping")
        return {"message": "Database Connected Successfully", "status": "ok"}
    except Exception as e:
        return {"error": str(e), "status": "error"}
