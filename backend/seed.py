import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
import certifi

load_dotenv()

# The same mock data converted to dicts to populate the db
ZONES_DATA = [
  {"id":"z1", "emoji":'🌳', "title":'Cubbon Park', "sub":'A lush 300-acre park in the heart of the city, perfect for morning walks and picnics.', "dist":'150m', "rating":'4.8', "mode":'calm', "bg":'calm-bg', "badge":'teal', "badgeTxt":'Calm', "lat":12.9766, "lng":77.5993, "type":"discover", "color":"#5eb88a"},
  {"id":"z2", "emoji":'☕', "title":'Matteo Coffee', "sub":'Specialty coffee roastery with cosy corners and quiet reading vibes.', "dist":'320m', "rating":'4.6', "mode":'comfort', "bg":'comfort-bg', "badge":'gold', "badgeTxt":'Comfort', "lat":12.9716, "lng":77.5946, "type":"discover", "color":"#d4a84b"},
  {"id":"z3", "emoji":'🎨', "title":'Pottery Lane', "sub":'A narrow street lined with local artisans, studios and ceramic galleries.', "dist":'0.8km', "rating":'4.9', "mode":'explore', "bg":'explore-bg', "badge":'plum', "badgeTxt":'Explore', "lat":12.9719, "lng":77.6112, "type":"discover", "color":"#9b6bbf"},
  {"id":"z4", "emoji":'🍵', "title":"Koshy's Café", "sub":"Bengaluru's oldest café — a literary institution since 1940.", "dist":'680m', "rating":'4.7', "mode":'comfort', "bg":'comfort-bg', "badge":'gold', "badgeTxt":'Iconic', "lat":12.9672, "lng":77.5921, "type":"popular", "color":"#d4a84b"},
]

CHALLENGES_DATA = [
  {"id":'c1', "icon":'🌿', "title":'Morning Green Walk', "desc":'Walk through a park before 9 AM three times this week.', "reward":'+120 XP · Blossom Card', "progress":2, "total":3, "color":'var(--teal)', "type":'active', "daily":True},
  {"id":'c2', "icon":'☕', "title":'Café Connoisseur', "desc":'Visit 5 different cafés this month and log your experience.', "reward":'+200 XP · Comfort Badge', "progress":3, "total":5, "color":'var(--gold)', "type":'active', "daily":False},
]

CARDS_DATA = [
  {"emoji":'🌸', "name":'Blossom Corner', "set":'Green Series', "rarity":'rare', "collected":True},
  {"emoji":'🌙', "name":'Night Lantern', "set":'Night Series', "rarity":'rare', "collected":True},
  {"emoji":'🌿', "name":'Green Path', "set":'Green Series', "rarity":'common', "collected":True},
  {"emoji":'☕', "name":'The Cosy Corner', "set":'Comfort Series', "rarity":'common', "collected":True},
]

CITIES_DATA = [
  {
    "id":'bengaluru', "name":'Bengaluru', "country":'Karnataka, India', "emoji":'🌆',
    "tagline":'The Garden City', "color":'var(--teal)', "colorHex":'#5eb88a',
    "userHere":True, "chaptersUnlocked":2, "chaptersTotal":3, "comingSoon": False,
    "chapters":[
      {"id":'mgroad', "num":'Chapter I', "area":'MG Road / Church Street', "emoji":'🏛',
        "theme":'Heritage & Culture',
        "desc":'The civic spine of the city. Colonial architecture, bookshops, live music.',
        "stops":["Church Street Social","Koshy's Café","MG Road Promenade","Atta Galatta Bookshop","Brigade Road Corner"],
        "stopsVisited":5, "stopsTotal":5, "progress":100, "color":'var(--teal)', "colorHex":'#5eb88a',
        "status":'complete', "xp":320, "card":'🏛 Heritage Walk Card'},
      {"id":'malleshwaram', "num":'Chapter II', "area":'Malleshwaram', "emoji":'🌸',
        "theme":'Old Bengaluru & Calm Streets',
        "desc":'Tree-lined lanes, century-old temples, morning flower markets.',
        "stops":["Sampige Road Market","Kadalekai Parishe Lane","Mantri Mall", "18th Cross", "Sankey Tank"],
        "stopsVisited":2, "stopsTotal":5, "progress":40, "color":'var(--gold)', "colorHex":'#d4a84b',
        "status":'active', "xp":280, "card":'🌸 Blossom Corner Card'}
    ]
  }
]

JOURNAL_DATA = [
  {"date":'Today, Thursday', "title":'A Morning in <em>Cubbon Park</em>', "body":'Arrived at 7:15 AM when the mist was still low on the lawns. The city hadn\'t woken yet.', "tags":['calm','morning','green'], "steps":'4.2k', "duration":'1h 10m', "mood":'😌', "moodColor":'var(--teal)'},
  {"date":'Wednesday, 4 Sep', "title":'<em>Pottery Lane</em> Discovery', "body":'Took a wrong turn and stumbled on this narrow alley lined with ceramic studios. Stayed an hour.', "tags":['explore','art','discovery'], "steps":'6.8k', "duration":'2h', "mood":'🤩', "moodColor":'var(--plum2)'},
]

async def seed_db():
    MONGODB_URL = os.getenv("MONGODB_URL")
    if not MONGODB_URL:
        print("Missing MONGODB_URL")
        return
        
    client = AsyncIOMotorClient(MONGODB_URL, tlsCAFile=certifi.where())
    db = client["citysense_db"]
    
    print("Clearing collections...")
    await db.zones.delete_many({})
    await db.challenges.delete_many({})
    await db.cards.delete_many({})
    await db.chapters.delete_many({})
    await db.journals.delete_many({})
    
    print("Seeding collections...")
    if ZONES_DATA: await db.zones.insert_many(ZONES_DATA)
    if CHALLENGES_DATA: await db.challenges.insert_many(CHALLENGES_DATA)
    if CARDS_DATA: await db.cards.insert_many(CARDS_DATA)
    if CITIES_DATA: await db.chapters.insert_many(CITIES_DATA)
    if JOURNAL_DATA: await db.journals.insert_many(JOURNAL_DATA)
    
    print("Seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed_db())
