import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
import certifi

load_dotenv()

# ZONES: Represent Map locations and Discoveries
ZONES_DATA = [
  {"id":"z1", "emoji":'🌳', "title":'Cubbon Park', "sub":'A lush 300-acre park in the heart of the city, perfect for morning walks and picnics.', "dist":'150m', "rating":'4.8', "mode":'calm', "bg":'calm-bg', "badge":'teal', "badgeTxt":'Calm', "lat":12.9766, "lng":77.5993, "type":"discover", "color":"#5eb88a"},
  {"id":"z2", "emoji":'☕', "title":'Matteo Coffee', "sub":'Specialty coffee roastery with cosy corners and quiet reading vibes.', "dist":'320m', "rating":'4.6', "mode":'comfort', "bg":'comfort-bg', "badge":'gold', "badgeTxt":'Comfort', "lat":12.9716, "lng":77.5946, "type":"discover", "color":"#d4a84b"},
  {"id":"z3", "emoji":'🎨', "title":'Pottery Lane', "sub":'A narrow street lined with local artisans, studios and ceramic galleries.', "dist":'0.8km', "rating":'4.9', "mode":'explore', "bg":'explore-bg', "badge":'plum', "badgeTxt":'Explore', "lat":12.9719, "lng":77.6112, "type":"discover", "color":"#9b6bbf"},
  {"id":"z4", "emoji":'🍵', "title":"Koshy's Café", "sub":"Bengaluru's oldest café — a literary institution since 1940.", "dist":'680m', "rating":'4.7', "mode":'comfort', "bg":'comfort-bg', "badge":'gold', "badgeTxt":'Iconic', "lat":12.9672, "lng":77.5921, "type":"popular", "color":"#d4a84b"},
  {"id":"z5", "emoji":'🌊', "title":'Ulsoor Lake', "sub":'A serene lakeside walking trail perfect for sunrise and sunset strolls.', "dist":'1.8km', "rating":'4.7', "mode":'calm', "bg":'calm-bg', "badge":'teal', "badgeTxt":'Calm', "lat":12.9818, "lng":77.6200, "type":"discover", "color":"#5eb88a"},
  {"id":"z6", "emoji":'🏛', "title":'Vidhana Soudha', "sub":'Iconic heritage architecture — best experienced on foot from the south entrance.', "dist":'1.1km', "rating":'4.5', "mode":'explore', "bg":'explore-bg', "badge":'plum', "badgeTxt":'Heritage', "lat":12.9796, "lng":77.5906, "type":"discover", "color":"#be96e0"},
  {"id":"z7", "emoji":'📚', "title":'Blossom Book House', "sub":'Three floors of second-hand books packed tightly onto ceiling-high shelves.', "dist":'400m', "rating":'4.9', "mode":'comfort', "bg":'comfort-bg', "badge":'gold', "badgeTxt":'Intellectual', "lat":12.9744, "lng":77.6050, "type":"popular", "color":"#d4a84b"},
  {"id":"z8", "emoji":'🌺', "title":'Sampige Road Market', "sub":'Bustling historic flower market filled with vibrant jasmine and marigolds.', "dist":'3km', "rating":'4.5', "mode":'explore', "bg":'explore-bg', "badge":'coral', "badgeTxt":'Cultural', "lat":13.0039, "lng":77.5714, "type":"popular", "color":"#d4735b"},
  {"id":"z9", "emoji":'🍻', "title":'Toit Brewpub', "sub":'A pioneer of craft beer culture in an energetic, multi-level woody space.', "dist":'4.5km', "rating":'4.8', "mode":'explore', "bg":'explore-bg', "badge":'plum', "badgeTxt":'Nightlife', "lat":12.9791, "lng":77.6406, "type":"popular", "color":"#be96e0"}
]

# CHALLENGES: Connects users to tasks and rewards
CHALLENGES_DATA = [
  {"id":'c1', "icon":'🌿', "title":'Morning Green Walk', "desc":'Walk through a park area before 9 AM three times this week.', "reward":'+120 XP · Blossom Card', "progress":2, "total":3, "color":'var(--teal)', "type":'active', "daily":True},
  {"id":'c2', "icon":'☕', "title":'Café Connoisseur', "desc":'Visit 5 different café zones this month and log your experience.', "reward":'+200 XP · Comfort Badge', "progress":3, "total":5, "color":'var(--gold)', "type":'active', "daily":False},
  {"id":'c3', "icon":'🔭', "title":'Hidden City Explorer', "desc":'Discover 3 hidden locations not on typical popular maps.', "reward":'+300 XP · Hidden Alcove Card', "progress":1, "total":3, "color":'var(--plum2)', "type":'active', "daily":False},
  {"id":'c4', "icon":'🌊', "title":'Waterside Wander', "desc":'Walk along Ulsoor Lake or Sankey Tank for 20 minutes.', "reward":'+150 XP · Water Series', "progress":0, "total":1, "color":'var(--sky)', "type":'active', "daily":True},
  {"id":'c5', "icon":'📖', "title":'Journal 7 Days', "desc":'Write a journal entry for 7 consecutive days.', "reward":'+150 XP · Storyteller Badge', "progress":7, "total":7, "color":'var(--sky)', "type":'completed', "daily":False}
]

# CARDS: Collectibles unlocked by visiting stops or finishing chapters
CARDS_DATA = [
  {"emoji":'🌸', "name":'Blossom Corner', "set":'Green Series', "rarity":'rare', "collected":True},
  {"emoji":'🌙', "name":'Night Lantern', "set":'Night Series', "rarity":'rare', "collected":True},
  {"emoji":'🌿', "name":'Green Path', "set":'Green Series', "rarity":'common', "collected":True},
  {"emoji":'☕', "name":'The Cosy Corner', "set":'Comfort Series', "rarity":'common', "collected":True},
  {"emoji":'🌊', "name":'Lake Silence', "set":'Water Series', "rarity":'rare', "collected":True},
  {"emoji":'🏛', "name":'Heritage Walk', "set":'Heritage Series', "rarity":'epic', "collected":False},
  {"emoji":'🔮', "name":'Hidden Alcove', "set":'Mystery Series', "rarity":'epic', "collected":False},
  {"emoji":'🌅', "name":'Dawn Walker', "set":'Morning Series', "rarity":'epic', "collected":False},
  {"emoji":'⭐', "name":'Stardust Alley', "set":'Night Series', "rarity":'legendary', "collected":False},
  {"emoji":'🔥', "name":'Eternal Flame', "set":'Heritage Series', "rarity":'legendary', "collected":False}
]

# CITIES & CHAPTERS: Major progression mechanism
CITIES_DATA = [
  {
    "id":'bengaluru', "name":'Bengaluru', "country":'Karnataka, India', "emoji":'🌆',
    "tagline":'The Garden City', "color":'var(--teal)', "colorHex":'#5eb88a',
    "userHere":True, "chaptersUnlocked":2, "chaptersTotal":3, "comingSoon": False,
    "chapters":[
      {"id":'mgroad', "num":'Chapter I', "area":'MG Road / Church Street', "emoji":'🏛',
        "theme":'Heritage & Culture',
        "desc":'The civic spine of the city. Colonial architecture, iconic bookshops, and live music venues lining a street that rarely sleeps.',
        "stops":["Church Street Social","Koshy's Café","Blossom Book House","Mayo Hall","Brigade Road Corner"],
        "stopsVisited":5, "stopsTotal":5, "progress":100, "color":'var(--teal)', "colorHex":'#5eb88a',
        "status":'complete', "xp":320, "card":'🏛 Heritage Walk Card'},
      {"id":'malleshwaram', "num":'Chapter II', "area":'Malleshwaram', "emoji":'🌸',
        "theme":'Old Bengaluru & Calm Streets',
        "desc":'Tree-lined lanes, century-old heritage temples, morning flower markets, and the unmistakable aroma of rich filter coffee.',
        "stops":["CTR (Sri Sagar)","Sampige Road Market","Kadu Malleshwara Temple", "18th Cross Walks", "Sankey Tank"],
        "stopsVisited":2, "stopsTotal":5, "progress":40, "color":'var(--gold)', "colorHex":'#d4a84b',
        "status":'active', "xp":280, "card":'🌸 Blossom Corner Card'},
      {"id":'indiranagar', "num":'Chapter III', "area":'Indiranagar', "emoji":'🌃',
        "theme":'Modern Pulse & Nightlife',
        "desc":'The modern, energetic heartbeat of the city. Microbreweries, contemporary art cafes, and hidden parks blending old and new.',
        "stops":["100ft Road Cross","Toit Brewpub","Third Wave Coffee", "12th Main Murals", "Defense Colony Parks"],
        "stopsVisited":0, "stopsTotal":5, "progress":0, "color":'var(--plum2)', "colorHex":'#be96e0',
        "status":'locked', "xp":350, "card":'🌃 Night Lantern Card'}
    ]
  },
  {
    "id":'hampi', "name":'Hampi', "country":'Karnataka, India', "emoji":'🏔',
    "tagline":'The Ruined Kingdom', "color":'var(--coral)', "colorHex":'#d4735b',
    "userHere":False, "chaptersUnlocked":0, "chaptersTotal":0, "comingSoon":True, "chapters":[]
  }
]

# JOURNALS: User's emotional memory mapping
JOURNAL_DATA = [
  {"date":'Today, Thursday', "title":'A Morning in <em>Cubbon Park</em>', "body":'Arrived at 7:15 AM when the mist was still low on the lawns. The city hadn\'t woken yet. Just birdsong, a few runners, and the smell of wet earth.', "tags":['calm','morning','green'], "steps":'4.2k', "duration":'1h 10m', "mood":'😌', "moodColor":'var(--teal)'},
  {"date":'Wednesday, 4 Sep', "title":'<em>Pottery Lane</em> Discovery', "body":'Took a wrong turn and stumbled on this narrow alley lined with ceramic studios. Spoke to a potter working on a tea set. Stayed an hour. Got a small cup.', "tags":['explore','art','discovery'], "steps":'6.8k', "duration":'2h', "mood":'🤩', "moodColor":'var(--plum2)'},
  {"date":'Sunday, 1 Sep', "title":'Ulsoor Lake at <em>Sunset</em>', "body":'The water turned amber at 6 PM. A few cyclists, a couple of ducks, and complete silence from the city for about twenty minutes. Rare and beautiful.', "tags":['calm','lakeside','sunset'], "steps":'5.1k', "duration":'1h 30m', "mood":'🌅', "moodColor":'var(--sky)'}
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
    await db.chapters.delete_many({}) # actually stores cities containing chapters
    await db.journals.delete_many({})
    
    print("Seeding collections...")
    if ZONES_DATA: await db.zones.insert_many(ZONES_DATA)
    if CHALLENGES_DATA: await db.challenges.insert_many(CHALLENGES_DATA)
    if CARDS_DATA: await db.cards.insert_many(CARDS_DATA)
    if CITIES_DATA: await db.chapters.insert_many(CITIES_DATA)
    if JOURNAL_DATA: await db.journals.insert_many(JOURNAL_DATA)
    
    print("Seeding complete! Database is freshly populated with robust Bengaluru data.")

if __name__ == "__main__":
    asyncio.run(seed_db())
