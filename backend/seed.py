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

def calculate_age_preferences(mode: str, osm_tags: dict) -> dict:
    # Base scores for each mode
    base = {
        'calm': {'teen': 65, 'adult': 70, 'senior': 88},
        'comfort': {'teen': 70, 'adult': 78, 'senior': 72},
        'explore': {'teen': 85, 'adult': 75, 'senior': 72}
    }
    
    scores = base.get(mode, {'teen': 60, 'adult': 70, 'senior': 75})
    
    # Fine-tune based on place characteristics
    name = osm_tags.get('name', '').lower()
    amenity = osm_tags.get('amenity', '').lower()
    leisure = osm_tags.get('leisure', '').lower()
    
    # Park or garden → boost calm preferences, especially seniors
    if leisure in ['park', 'garden', 'nature_reserve']:
        scores['teen'] = min(100, scores['teen'] + 5)
        scores['senior'] = min(100, scores['senior'] + 12)
        
    # Museum, monument, historic → good for teens (adventurous), decent for seniors (heritage)
    if osm_tags.get('historic') or 'museum' in amenity:
        scores['teen'] = min(100, scores['teen'] + 12)
        scores['adult'] = min(100, scores['adult'] + 5)
        scores['senior'] = min(100, scores['senior'] + 8)
    
    # Café → good for adults (work/social), okay for teens (hangout), less for seniors (noise)
    if amenity == 'cafe' or 'cafe' in name or 'coffee' in name:
        scores['teen'] = min(100, scores['teen'] + 5)
        scores['adult'] = min(100, scores['adult'] + 8)
        scores['senior'] = min(100, scores['senior'] - 5)  # Busy cafes may not suit seniors
    
    # Quiet/peaceful keywords → boost senior and adult preferences
    quiet_keywords = ['peaceful', 'quiet', 'serene', 'botanical', 'temple', 'shrine']
    if any(kw in name for kw in quiet_keywords):
        scores['senior'] = min(100, scores['senior'] + 5)
        scores['adult'] = min(100, scores['adult'] + 3)
    
    # Vibrant/energetic keywords → boost teen preferences
    energetic_keywords = ['bar', 'pub', 'brewpub', 'nightlife', 'club', 'entertainment']
    if any(kw in name for kw in energetic_keywords):
        scores['teen'] = min(100, scores['teen'] + 10)
        scores['adult'] = min(100, scores['adult'] + 5)
    
    # Clamp all scores to 0-100
    return {k: max(0, min(100, v)) for k, v in scores.items()}

def assign_experience_tags(mode: str, name: str, osm_tags: dict) -> list:
    tags = []
    name_lower = name.lower()
    amenity = osm_tags.get('amenity', '').lower()
    leisure = osm_tags.get('leisure', '').lower()
    tourism = osm_tags.get('tourism', '').lower()
    historic = osm_tags.get('historic', '').lower()
    
    # ===== CALM MODE TAGS =====
    if mode == 'calm':
        tags.append('quiet')
        tags.append('scenic')
        tags.append('walkable')
        
        # Parks specifically
        if leisure in ['park', 'garden', 'nature_reserve']:
            tags.append('accessible')
            if 'botanical' in name_lower or 'lake' in name_lower:
                tags.append('scenic')
        
        # Historic/temple sites in calm
        if historic or tourism in ['attraction', 'viewpoint']:
            if any(word in name_lower for word in ['temple', 'mosque', 'shrine', 'church']):
                tags.append('cultural')
                tags.append('heritage')
    
    # ===== COMFORT MODE TAGS =====
    elif mode == 'comfort':
        tags.append('cozy')
        
        # Cafés and restaurants
        if amenity in ['cafe', 'restaurant', 'fast_food', 'food_court']:
            tags.append('social')
            tags.append('work-friendly')
            
            # Branded cafés: more youthful vibe
            iconic_brands = ['starbucks', 'costa', 'dunkin', 'toit', 'third wave', 'blue tokai', 'work republic']
            if any(brand in name_lower for brand in iconic_brands):
                tags.append('youthful')
        
        # Bars and pubs
        if amenity in ['pub', 'bar', 'cafe_lounge']:
            tags.append('social')
            if any(word in name_lower for word in ['brew', 'micro', 'craft']):
                tags.append('youthful')
        
        tags.append('accessible')
    
    # ===== EXPLORE MODE TAGS =====
    elif mode == 'explore':
        tags.append('scenic')
        tags.append('cultural')
        
        # Historic/heritage sites
        if historic or tourism in ['attraction', 'archaeological_site', 'viewpoint']:
            if any(word in name_lower for word in ['temple', 'mosque', 'church', 'shrine', 'fort', 'palace', 'stupa']):
                tags.append('heritage')
                tags.append('walkable')
            elif 'archaeological' in tourism or any(word in name_lower for word in ['ruin', 'ancient', 'archaeological']):
                tags.append('heritage')
        
        # Artsy spaces
        if amenity in ['gallery', 'museum', 'art_center', 'bookstore']:
            tags.append('cultural')
            tags.append('youthful')
        
        # Alleys and narrow lanes (exploration friendly)
        if any(word in name_lower for word in ['lane', 'alley', 'street', 'passage', 'street art', 'murals']):
            tags.append('walkable')
            tags.append('scenic')
    
    # ===== COMMON ATTRIBUTES ACROSS MODES =====
    
    # Water features universally scenic
    if any(word in name_lower for word in ['lake', 'pond', 'river', 'waterfront', 'tank', 'reservoir']):
        if 'scenic' not in tags:
            tags.append('scenic')
        tags.append('walkable')
    
    # Natural areas universally walkable and accessible
    if leisure in ['park', 'garden', 'nature_reserve', 'playground', 'sports_center']:
        if 'walkable' not in tags:
            tags.append('walkable')
        if 'accessible' not in tags:
            tags.append('accessible')
    
    # Sports facilities are active
    if amenity in ['sports_center', 'gym', 'swimming_pool'] or leisure in ['sports_center', 'playground']:
        tags.append('active')
    
    # Nightlife venues
    if amenity in ['bar', 'pub', 'nightclub'] or any(word in name_lower for word in ['bar', 'pub', 'club', 'lounge']):
        if 'nightlife' not in tags:
            tags.append('nightlife')
        if 'social' not in tags:
            tags.append('social')
    
    # Social gathering places
    if amenity in ['cafe', 'restaurant', 'pub', 'bar', 'community_center']:
        if 'social' not in tags:
            tags.append('social')
    
    # Remove duplicates while preserving order
    tags = list(dict.fromkeys(tags))
    
    # Return 2-5 tags (most diverse recommendations)
    return tags[:5] if len(tags) > 5 else tags

def calculate_experience_tag_boost(age_group: str, experience_tags: list) -> float:
    if not experience_tags or age_group not in ["teen", "adult", "senior"]:
        return 0.0
    
    # Define tag boosts per age group
    tag_boosts = {
        "teen": {
            "social": 8,
            "youthful": 8,
            "active": 8,
            "nightlife": 8,
            "scenic": 3,
            "walkable": 2,
            # Negative boosts (reduce score)
            "quiet": -5,
            "cozy": -3,
            "accessible": -2,
            "heritage": -3,
        },
        "adult": {
            "cultural": 8,
            "work-friendly": 8,
            "cozy": 6,
            "scenic": 6,
            "social": 4,
            "walkable": 3,
            "active": 2,
            # Negative boosts
            "youthful": -3,
            "nightlife": -4,
            "quiet": -2,
        },
        "senior": {
            "accessible": 10,
            "quiet": 8,
            "heritage": 8,
            "scenic": 7,
            "walkable": 7,
            "cozy": 4,
            "cultural": 4,
            # Negative boosts
            "nightlife": -8,
            "youthful": -6,
            "active": -4,
            "social": -3,
        }
    }
    
    boosts = tag_boosts.get(age_group, {})
    total_boost = 0.0
    
    # Sum boosts for all matching tags
    for tag in experience_tags:
        if tag in boosts:
            total_boost += boosts[tag]
    
    # Clamp to 0-40 range (represents up to 40% boost to recommendation score)
    return max(0.0, min(40.0, total_boost))

def calculate_experience_quality_score(name: str, osm_tags: dict, rating: float) -> float:
    name_lower = name.lower()
    amenity = osm_tags.get('amenity', '').lower()
    leisure = osm_tags.get('leisure', '').lower()
    tourism = osm_tags.get('tourism', '').lower()
    historic = osm_tags.get('historic', '').lower()
    
    score = 50  # Neutral baseline
    
    # === BOOST HIGH-QUALITY EXPERIENTIAL PLACES ===
    
    # Social/food places: cafés, restaurants, bars → strong experiential value
    if amenity in ['cafe', 'restaurant', 'pub', 'bar', 'cafe_lounge', 'fast_food', 'food_court']:
        score += 25  # Strong experiential value
        # Named establishment → even better
        if len(name) > 5 and name_lower not in ['café', 'cafe', 'restaurant', 'pub', 'bar']:
            score += 15
    
    # Natural spaces: parks, gardens, nature reserves → serene, meaningful
    if leisure in ['park', 'garden', 'nature_reserve', 'playground', 'sports_center', 'swimming_pool']:
        score += 28  # High experiential value
        # Major parks especially → people go there intentionally
        major_keywords = ['central', 'city', 'main', 'public', 'national', 'state', 'heritage', 'lake']
        if any(kw in name_lower for kw in major_keywords):
            score += 15  # Known destination
    
    # Cultural/exploratory places: galleries, museums, bookstores → memorable
    if amenity in ['museum', 'gallery', 'library', 'bookstore', 'art_center', 'community_center']:
        score += 30  # Very high experiential value
    
    # Water features: lakes, ponds, rivers → scenic and memorable
    if any(word in name_lower for word in ['lake', 'pond', 'river', 'waterfront', 'reservoir']):
        score += 22  # Scenic, memorable
    
    # Historic/cultural heritage: temples, churches, forts, palaces → meaningful
    if historic or tourism in ['attraction', 'viewpoint', 'archaeological_site', 'monument']:
        if any(word in name_lower for word in ['temple', 'mosque', 'church', 'shrine', 'fort', 'palace', 'monument', 'stupa']):
            score += 25  # Meaningful cultural heritage
        else:
            # Generic historic marker without context → low quality
            score -= 15
    
    # Bookstores, shops with character → supports exploration
    if amenity in ['bookstore', 'gift_shop', 'antique', 'crafts_shop']:
        score += 20
    
    # Named, established places: length > 5 chars, not generic → means someone cared to name it
    if len(name) > 5 and name_lower not in ['café', 'cafe', 'restaurant', 'park', 'garden']:
        score += 10  # More likely meaningful
    
    # === PENALIZE LOW-VALUE PLACES ===
    
    # Unnamed or completely generic names → low quality
    if name_lower in ['café', 'cafe', 'restaurant', 'shop', 'store', 'park', 'garden', 'church', 
                      'temple', 'monument', 'memorial', 'structure', 'building', 'venue']:
        score -= 25  # Generic name = low quality
    
    # Very short names (< 3 chars) likely broken/spam data
    if len(name) < 3:
        score -= 20
    
    # Utility/administrative/infrastructure → not experiential
    utility_words = ['utility', 'storage', 'depot', 'warehouse', 'office', 'administration',
                     'government', 'police', 'military', 'power', 'electrical', 'water_works']
    if any(word in name_lower for word in utility_words):
        score -= 30  # Not a place to visit
    
    # Memorial markers without narrative value
    memorial_words = ['memorial', 'marker', 'plaque', 'statue', 'statue_of']
    if any(word in name_lower for word in memorial_words):
        # Unless it's a famous/named memorial
        if len(name) < 15:
            score -= 20  # Obscure/unnamed memorial
    
    # Obscure technical tags
    if historic and amenity not in ['cafe', 'restaurant', 'museum', 'gallery']:
        if all(word not in name_lower for word in ['temple', 'mosque', 'church', 'fort', 'palace', 'archaeological']):
            score -= 15  # Random historic tag without meaningful context
    
    # Low rating on already generic place → definitely poor quality
    if rating < 4.0 and len(name) < 8:
        score -= 10  # Poor rating + generic = skip
    
    # === FILTER OUT EXTREMELY WEAK RECOMMENDATIONS ===
    
    # Clamp to 0-100
    score = max(0, min(100, score))
    
    return score

def classify_popularity(name: str, osm_tags: dict, rating: float) -> tuple[str, float]:
    name_lower = name.lower()
    amenity = osm_tags.get('amenity', '').lower()
    leisure = osm_tags.get('leisure', '').lower()
    tourism = osm_tags.get('tourism', '').lower()
    
    score = 45  # Start slightly below neutral to avoid over-classification
    
    # Iconic/branded café chains → strong signal for popular
    iconic_brands = ['starbucks', 'costa', 'dunkin', 'nespresso', "mcd", "burger king",
                     'koshy', 'toit', 'third wave', 'work republic', 'chai point', 'blue tokai']
    if any(brand in name_lower for brand in iconic_brands):
        score += 35  # Strong signal for popular (even stronger now)
    
    # Branded restaurants/bars → popular
    elif amenity in ['restaurant', 'pub', 'bar']:
        score += 18  # Slightly more selective
    
    # Major parks → popular (but local parks stay discover)
    if leisure == 'park':
        major_park_keywords = ['central', 'city', 'main', 'public', 'national', 'state', 'heritage']
        if any(kw in name_lower for kw in major_park_keywords):
            score += 22  # Major parks are popular
        else:
            score += 3   # Local/neighborhood parks stay discover
    
    # Museums, galleries, tourism attractions → popular
    elif amenity in ['museum', 'gallery'] or tourism:
        score += 28  # Museums and attractions are usually popular
    
    # Historic monuments → carefully distinguish
    elif osm_tags.get('historic'):
        if any(word in name_lower for word in ['temple', 'church', 'mosque', 'shrine', 'fort', 'palace']):
            score += 20  # Religious/fortress sites tend to be known
        else:
            score += 5   # Generic historic markers are more discover
    
    # Rating boost: Higher ratings shift toward 'popular'
    # But only for places that already have some popularity signals
    if rating >= 4.8:
        score += 10  # Very high rating boost
    elif rating >= 4.5:
        score += 5   # Moderate boost
    elif rating >= 4.0:
        score += 2   # Small boost (doesn't alone make it popular)
    
    # Word patterns suggesting local/niche → strongly discover
    local_keywords = ['local', 'corner', 'shop', 'clinic', 'pharmacy', 'laundry', 'store']
    if any(kw in name_lower for kw in local_keywords):
        score -= 20  # Strongly signals discover
    
    # Quiet/hidden gem keywords → discover
    hidden_keywords = ['alley', 'lane', 'street', 'passage', 'nook', 'garden']
    if any(kw in name_lower for kw in hidden_keywords):
        score -= 12
    
    # Clamp score to 0-100
    score = max(0, min(100, score))
    
    # Threshold: 65+ = popular (stricter now), <65 = discover
    # This reduces weak borderline classifications in the 50-65 range
    zone_type = "popular" if score >= 65 else "discover"
    return (zone_type, score)

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
    low_quality_count = 0
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
                
                age_prefs = calculate_age_preferences(mode, tags)
                rating_val = round(random.uniform(4.2, 5.0), 1)
                zone_type, pop_score = classify_popularity(name, tags, rating_val)
                
                # NEW: Calculate experience quality score
                quality_score = calculate_experience_quality_score(name, tags, rating_val)
                
                # NEW: Assign experience tags
                exp_tags = assign_experience_tags(mode, name, tags)
                
                # FILTER: Skip extremely low-quality places (e.g., unnamed memorials, utility nodes)
                # Quality < 25: random OSM garbage, skip
                # Quality 25-40: poor but keep as fallback
                # Quality 40+: acceptable
                if quality_score < 25:
                    low_quality_count += 1
                    continue
                    
                zones.append({
                    "id": f"osm_{e['id']}",
                    "emoji": emoji,
                    "title": name,
                    "sub": f"A verified real-world {badge.lower()} location.",
                    "dist": f"{random.randint(100, 900)}m",
                    "rating": str(rating_val),
                    "mode": mode,
                    "bg": f"{mode}-bg",
                    "badge": "gold" if mode=="comfort" else "teal" if mode=="calm" else "plum",
                    "badgeTxt": badge,
                    "lat": e['lat'],
                    "lng": e['lon'],
                    "type": zone_type,
                    "color": color,
                    "chapter_id": chapter_id,
                    "card_name": random.choice(CARD_MAP[mode]),
                    "image_url": img,
                    "description": desc,
                    "age_preferences": age_prefs,
                    "popularity_score": pop_score,
                    "quality_score": quality_score,  # NEW: Added quality score
                    "experience_tags": exp_tags  # NEW: Added experience tags
                })
        
        # Sort by quality score (descending) to prioritize better recommendations
        zones.sort(key=lambda z: z.get("quality_score", 50), reverse=True)
        
        print(f"-> Successfully fetched {len(zones)} places for {chapter_id} (filtered {low_quality_count} low-quality entries).")
    except Exception as ex:
        print(f"OSM ingestion failed for {chapter_id}: {ex}")
    return zones

FALLBACK_ZONES_DATA = [
  {"id":"z1", "emoji":'🌳', "title":'Cubbon Park', "sub":'A lush 300-acre park in the heart of the city.', "dist":'150m', "rating":'4.8', "mode":'calm', "bg":'calm-bg', "badge":'teal', "badgeTxt":'Calm', "lat":12.9766, "lng":77.5993, "type":"discover", "color":"#5eb88a", "chapter_id": "mgroad", "card_name": "Green Path", "image_url": UNSPLASH_PARKS[0], "description": "A serene green space providing a quiet escape.", "age_preferences": {"teen": 70, "adult": 75, "senior": 95}, "popularity_score": 58, "quality_score": 85, "experience_tags": ["quiet", "scenic", "walkable", "accessible"]},
  {"id":"z3", "emoji":'🎨', "title":'Pottery Lane', "sub":'A narrow street lined with artisans.', "dist":'0.8km', "rating":'4.9', "mode":'explore', "bg":'explore-bg', "badge":'plum', "badgeTxt":'Explore', "lat":12.9719, "lng":77.6112, "type":"discover", "color":"#9b6bbf", "chapter_id": "indiranagar", "card_name": "Heritage Walk", "image_url": UNSPLASH_HERITAGE[0], "description": "A cultural zone full of history and local art.", "age_preferences": {"teen": 90, "adult": 78, "senior": 65}, "popularity_score": 52, "quality_score": 82, "experience_tags": ["scenic", "cultural", "walkable", "youthful"]},
  {"id":"z4", "emoji":'🍵', "title":"Koshy's Café", "sub":"Bengaluru's oldest café.", "dist":'680m', "rating":'4.7', "mode":'comfort', "bg":'comfort-bg', "badge":'gold', "badgeTxt":'Iconic', "lat":12.9672, "lng":77.5921, "type":"popular", "color":"#d4a84b", "chapter_id": "mgroad", "card_name": "The Cosy Corner", "image_url": UNSPLASH_CAFES[1], "description": "An iconic space bustling with intellectuals.", "age_preferences": {"teen": 75, "adult": 85, "senior": 70}, "popularity_score": 80, "quality_score": 88, "experience_tags": ["cozy", "social", "work-friendly", "youthful"]},
  {"id":"am1", "emoji":'☕', "title":'Kafetoz Kasavanahalli', "sub":'A perfect spot for a quick coffee.', "dist":'150m', "rating":'4.5', "mode":'comfort', "bg":'comfort-bg', "badge":'gold', "badgeTxt":'Comfort', "lat":12.894327531892325, "lng":77.67767429351208, "type":"popular", "color":"#d4a84b", "chapter_id": "amrita", "card_name": "The Cosy Corner", "image_url": UNSPLASH_CAFES[0], "description": "Great coffee near the campus.", "age_preferences": {"teen": 90, "adult": 85, "senior": 50}, "popularity_score": 75, "quality_score": 85, "experience_tags": ["cozy", "social", "youthful"]},
  {"id":"am2", "emoji":'🧁', "title":'Mighty Paws Cafe and Bakery', "sub":'Fresh bakes and hot beverages.', "dist":'800m', "rating":'4.6', "mode":'comfort', "bg":'comfort-bg', "badge":'gold', "badgeTxt":'Comfort', "lat":12.902367866869678, "lng":77.67719470236682, "type":"popular", "color":"#d4a84b", "chapter_id": "amrita", "card_name": "Dawn Walker", "image_url": UNSPLASH_CAFES[1], "description": "Known for delicious pastries and relaxed vibe.", "age_preferences": {"teen": 85, "adult": 80, "senior": 60}, "popularity_score": 72, "quality_score": 88, "experience_tags": ["cozy", "social", "work-friendly"]},
  {"id":"am3", "emoji":'🌊', "title":'Kasavanahalli Lake', "sub":'A calm lakeside view.', "dist":'1.2km', "rating":'4.7', "mode":'calm', "bg":'calm-bg', "badge":'teal', "badgeTxt":'Calm', "lat":12.9042, "lng":77.6728, "type":"discover", "color":"#5eb88a", "chapter_id": "amrita", "card_name": "Lake Silence", "image_url": UNSPLASH_PARKS[1], "description": "Perfect for morning walks.", "age_preferences": {"teen": 65, "adult": 75, "senior": 90}, "popularity_score": 60, "quality_score": 80, "experience_tags": ["quiet", "scenic", "walkable", "accessible"]},
  {"id":"am4", "emoji":'📚', "title":'Central Library Amrita', "sub":'Quiet study zones.', "dist":'50m', "rating":'4.9', "mode":'explore', "bg":'explore-bg', "badge":'plum', "badgeTxt":'Explore', "lat":12.8955, "lng":77.6752, "type":"discover", "color":"#9b6bbf", "chapter_id": "amrita", "card_name": "Hidden Alcove", "image_url": UNSPLASH_HERITAGE[1], "description": "A massive collection of books and silence.", "age_preferences": {"teen": 95, "adult": 80, "senior": 70}, "popularity_score": 50, "quality_score": 75, "experience_tags": ["quiet", "youthful", "walkable"]},
  {"id":"am5", "emoji":'🏛', "title":'Amriteshwari Temple', "sub":'A serene spiritual center.', "dist":'100m', "rating":'4.8', "mode":'calm', "bg":'calm-bg', "badge":'teal', "badgeTxt":'Calm', "lat":12.8948, "lng":77.6760, "type":"discover", "color":"#5eb88a", "chapter_id": "amrita", "card_name": "Heritage Walk", "image_url": UNSPLASH_HERITAGE[2], "description": "Peaceful atmosphere on campus.", "age_preferences": {"teen": 60, "adult": 70, "senior": 95}, "popularity_score": 55, "quality_score": 85, "experience_tags": ["quiet", "heritage", "accessible"]}
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
    "userHere":True, "chaptersUnlocked":3, "chaptersTotal":4, "comingSoon": False,
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
        "status":'active', "xp":350, "card":'🌃 Night Lantern Card', "centerLat": 12.9785, "centerLng": 77.6408, "sensoryBase": {"noise": 75, "crowd": 90, "air": 70, "vibe": 95}},
      {"id":'amrita', "num":'Chapter IV', "area":'Amrita Vishwa Vidyapeetham', "emoji":'🎓',
        "theme":'Campus Life & Nearby Spots',
        "desc":'The energetic student campus surrounded by popular cafes, local bakeries, and serene lakes perfect for taking a break from studies.',
        "stops":["Kafetoz Kasavanahalli", "Mighty Paws Cafe", "Kasavanahalli Lake", "Central Library", "Amriteshwari Temple"],
        "stopsVisited":0, "stopsTotal":5, "progress":0, "color":'var(--sky)', "colorHex":'#7293d4',
        "status":'active', "xp":400, "card":'🎓 Campus Explorer Card', "centerLat": 12.895193, "centerLng": 77.675684, "sensoryBase": {"noise": 60, "crowd": 80, "air": 65, "vibe": 90}}
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
    targets = [("mgroad", 12.9740, 77.6010), ("malleshwaram", 13.0040, 77.5715), ("indiranagar", 12.9785, 77.6408), ("amrita", 12.895193, 77.675684)]
    for cid, lat, lng in targets:
        zones = fetch_osm_places(cid, lat, lng)
        # ALWAYS append chapter-specific fallback zones
        chapter_fb = [z.copy() for z in FALLBACK_ZONES_DATA if z.get("chapter_id") == cid]
        zones.extend(chapter_fb)
        
        if len(zones) == 0:
            print(f"Falling back to all hardcoded zones for {cid}.")
            # Use all fallback zones to ensure we have both discover and popular types
            fb_zones = [z.copy() for z in FALLBACK_ZONES_DATA]
            for i, z in enumerate(fb_zones):
                z["id"] = f"{cid}_fallback_{i}"
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
