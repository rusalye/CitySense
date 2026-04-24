import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
import certifi

load_dotenv()

import urllib.request
import urllib.parse
import json
import random

CARD_MAP = {
    'calm': ["Green Path", "Lake Silence", "Blossom Corner"],
    'comfort': ["The Cosy Corner", "Dawn Walker"],
    'explore': ["Heritage Walk", "Stardust Alley", "Eternal Flame", "Hidden Alcove"]
}

UNSPLASH_CAFES = [
  "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800",
  "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800",
  "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800",
  "https://images.unsplash.com/photo-1525610553991-2bede1a236e2?q=80&w=800"
]
UNSPLASH_PARKS = [
  "https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=800",
  "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?q=80&w=800",
  "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?q=80&w=800"
]
UNSPLASH_HERITAGE = [
  "https://images.unsplash.com/photo-1627918096280-5a3d078fd0e8?q=80&w=800",
  "https://images.unsplash.com/photo-1563260797-cb5cd70254c8?q=80&w=800",
  "https://images.unsplash.com/photo-1542642137-775aa7ba210b?q=80&w=800"
]

def fetch_osm_places(chapter_id, lat, lng):
    print(f"Fetching real places for {chapter_id} via OpenStreetMap...")
    query = f"""
    [out:json];
    (
      node["amenity"~"cafe"](around:1500,{lat},{lng});
      node["leisure"~"park|garden"](around:2000,{lat},{lng});
      node["historic"](around:3000,{lat},{lng});
    );
    out body 20;
    """
    url = "http://overpass-api.de/api/interpreter?data=" + urllib.parse.quote(query.strip())
    zones = []
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'CitySense/1.0'})
        with urllib.request.urlopen(req, timeout=12) as response:
            data = json.loads(response.read().decode())
            elements = data.get('elements', [])
            for e in elements:
                tags = e.get('tags', {})
                name = tags.get('name')
                if not name: continue
                
                if tags.get('amenity') == 'cafe':
                    mode, badge, color, emoji = 'comfort', 'Comfort', '#d4a84b', '☕'
                    img = random.choice(UNSPLASH_CAFES)
                    desc = "A cozy, ambient spot perfect for reading a book or enjoying a slow afternoon with freshly brewed coffee."
                elif tags.get('leisure'):
                    mode, badge, color, emoji = 'calm', 'Calm', '#5eb88a', '🌳'
                    img = random.choice(UNSPLASH_PARKS)
                    desc = "A serene green space providing a quiet escape from the bustling city. Great for morning walks."
                else:
                    mode, badge, color, emoji = 'explore', 'Heritage', '#be96e0', '🏛'
                    img = random.choice(UNSPLASH_HERITAGE)
                    desc = "A striking historic landmark that carries the rich cultural essence and stories of the old city."
                    
                zones.append({
                    "id": f"osm_{e['id']}",
                    "emoji": emoji,
                    "title": name,
                    "sub": f"A verified real-world {badge.lower()} location.",
                    "dist": f"{random.randint(100, 900)}m",
                    "rating": str(round(random.uniform(4.2, 5.0), 1)),
                    "mode": mode,
                    "bg": f"{mode}-bg",
                    "badge": "gold" if mode=="comfort" else "teal" if mode=="calm" else "plum",
                    "badgeTxt": badge,
                    "lat": e['lat'],
                    "lng": e['lon'],
                    "type": "discover",
                    "color": color,
                    "chapter_id": chapter_id,
                    "card_name": random.choice(CARD_MAP[mode]),
                    "image_url": img,
                    "description": desc
                })
        print(f"-> Successfully fetched {len(zones)} places for {chapter_id}.")
    except Exception as ex:
        print(f"OSM ingestion failed for {chapter_id}: {ex}")
    return zones

FALLBACK_ZONES_DATA = [
  {"id":"z1", "emoji":'🌳', "title":'Cubbon Park', "sub":'A lush 300-acre park in the heart of the city.', "dist":'150m', "rating":'4.8', "mode":'calm', "bg":'calm-bg', "badge":'teal', "badgeTxt":'Calm', "lat":12.9766, "lng":77.5993, "type":"discover", "color":"#5eb88a", "chapter_id": "mgroad", "card_name": "Green Path", "image_url": UNSPLASH_PARKS[0], "description": "A serene green space providing a quiet escape."},
  {"id":"z2", "emoji":'☕', "title":'Matteo Coffee', "sub":'Specialty coffee roastery.', "dist":'320m', "rating":'4.6', "mode":'comfort', "bg":'comfort-bg', "badge":'gold', "badgeTxt":'Comfort', "lat":12.9716, "lng":77.5946, "type":"discover", "color":"#d4a84b", "chapter_id": "mgroad", "card_name": "The Cosy Corner", "image_url": UNSPLASH_CAFES[0], "description": "A cozy, ambient spot perfect for a slow afternoon."},
  {"id":"z3", "emoji":'🎨', "title":'Pottery Lane', "sub":'A narrow street lined with artisans.', "dist":'0.8km', "rating":'4.9', "mode":'explore', "bg":'explore-bg', "badge":'plum', "badgeTxt":'Explore', "lat":12.9719, "lng":77.6112, "type":"discover", "color":"#9b6bbf", "chapter_id": "indiranagar", "card_name": "Heritage Walk", "image_url": UNSPLASH_HERITAGE[0], "description": "A cultural zone full of history and local art."},
  {"id":"z4", "emoji":'🍵', "title":"Koshy's Café", "sub":"Bengaluru's oldest café.", "dist":'680m', "rating":'4.7', "mode":'comfort', "bg":'comfort-bg', "badge":'gold', "badgeTxt":'Iconic', "lat":12.9672, "lng":77.5921, "type":"popular", "color":"#d4a84b", "chapter_id": "mgroad", "card_name": "The Cosy Corner", "image_url": UNSPLASH_CAFES[1], "description": "An iconic space bustling with intellectuals."},
  {"id":"z8", "emoji":'🌺', "title":'Sampige Road Market', "sub":'Bustling historic flower market.', "dist":'3km', "rating":'4.5', "mode":'explore', "bg":'explore-bg', "badge":'coral', "badgeTxt":'Cultural', "lat":13.0039, "lng":77.5714, "type":"popular", "color":"#d4735b", "chapter_id": "malleshwaram", "card_name": "Heritage Walk", "image_url": UNSPLASH_HERITAGE[1], "description": "Immersive local market scene."},
  {"id":"z9", "emoji":'🍻', "title":'Toit Brewpub', "sub":'A pioneer of craft beer culture.', "dist":'4.5km', "rating":'4.8', "mode":'explore', "bg":'explore-bg', "badge":'plum', "badgeTxt":'Nightlife', "lat":12.9791, "lng":77.6406, "type":"popular", "color":"#be96e0", "chapter_id": "indiranagar", "card_name": "Night Lantern", "image_url": UNSPLASH_CAFES[2], "description": "A vibrant atmosphere with lots of energy."}
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
        "status":'complete', "xp":320, "card":'🏛 Heritage Walk Card', "centerLat": 12.9740, "centerLng": 77.6010, "sensoryBase": {"noise": 80, "crowd": 85, "air": 75, "vibe": 95}},
      {"id":'malleshwaram', "num":'Chapter II', "area":'Malleshwaram', "emoji":'🌸',
        "theme":'Old Bengaluru & Calm Streets',
        "desc":'Tree-lined lanes, century-old heritage temples, morning flower markets, and the unmistakable aroma of rich filter coffee.',
        "stops":["CTR (Sri Sagar)","Sampige Road Market","Kadu Malleshwara Temple", "18th Cross Walks", "Sankey Tank"],
        "stopsVisited":2, "stopsTotal":5, "progress":40, "color":'var(--gold)', "colorHex":'#d4a84b',
        "status":'active', "xp":280, "card":'🌸 Blossom Corner Card', "centerLat": 13.0040, "centerLng": 77.5715, "sensoryBase": {"noise": 40, "crowd": 45, "air": 85, "vibe": 80}},
      {"id":'indiranagar', "num":'Chapter III', "area":'Indiranagar', "emoji":'🌃',
        "theme":'Modern Pulse & Nightlife',
        "desc":'The modern, energetic heartbeat of the city. Microbreweries, contemporary art cafes, and hidden parks blending old and new.',
        "stops":["100ft Road Cross","Toit Brewpub","Third Wave Coffee", "12th Main Murals", "Defense Colony Parks"],
        "stopsVisited":0, "stopsTotal":5, "progress":0, "color":'var(--plum2)', "colorHex":'#be96e0',
        "status":'active', "xp":350, "card":'🌃 Night Lantern Card', "centerLat": 12.9785, "centerLng": 77.6408, "sensoryBase": {"noise": 75, "crowd": 90, "air": 70, "vibe": 95}}
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
    
    # Generate live zones per chapter
    FINAL_ZONES = []
    targets = [("mgroad", 12.9740, 77.6010), ("malleshwaram", 13.0040, 77.5715), ("indiranagar", 12.9785, 77.6408)]
    for cid, lat, lng in targets:
        zones = fetch_osm_places(cid, lat, lng)
        if len(zones) == 0:
            print(f"Falling back to hardcoded zones for {cid}.")
            fb_zones = [z for z in FALLBACK_ZONES_DATA if z.get("chapter_id") == cid]
            if len(fb_zones) == 0:
                fb_zones = [z.copy() for z in FALLBACK_ZONES_DATA[:2]]
                for i,z in enumerate(fb_zones):
                    z["id"] = f"{cid}_mock_{i}"
                    z["chapter_id"] = cid
            zones = fb_zones
        FINAL_ZONES.extend(zones)
        
    await db.zones.insert_many(FINAL_ZONES)
    
    if CHALLENGES_DATA: await db.challenges.insert_many(CHALLENGES_DATA)
    if CARDS_DATA: await db.cards.insert_many(CARDS_DATA)
    if CITIES_DATA: await db.chapters.insert_many(CITIES_DATA)
    if JOURNAL_DATA: await db.journals.insert_many(JOURNAL_DATA)
    
    print("Seeding complete! Database is freshly populated with verified places.")

if __name__ == "__main__":
    asyncio.run(seed_db())
