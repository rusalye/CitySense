from fastapi import APIRouter, Request
from typing import List, Optional
import re
from models.zone_model import Zone
from seed import calculate_experience_tag_boost

router = APIRouter()

def get_db(request: Request):
    return request.app.state.db

def normalize_place_name(name: str) -> str:
    """
    Normalize place names to detect duplicate chains and branches.
    
    Deduplication Strategy:
    - Removes punctuation (apostrophes, hyphens, etc.) that vary between branches
    - Removes branch location identifiers (area names, addresses)
    - Keeps core place name to detect chain duplicates
    - Converts to lowercase for case-insensitive matching
    
    Key: We remove AREA NAMES and ADDRESSES that specify branches,
         but keep place-type words (Lane, Street, Park) that are part of official names.
    
    Examples:
    - "Cafe Coffee Day, MG Road" → "cafe coffee day"
    - "Cafe Coffee Day (Indiranagar)" → "cafe coffee day"
    - "Pottery Lane Indiranagar" → "pottery lane" (Lane is part of name, Indiranagar is branch)
    - "Chai Point, 12th Main" → "chai point"
    - "Koshys Cafe, MG Road" → "koshys cafe"
    
    Returns:
    - Normalized string for comparison
    """
    # Convert to lowercase
    normalized = name.lower()
    
    # Remove punctuation (keep only alphanumeric and spaces)
    normalized = re.sub(r"[^a-z0-9\s]", "", normalized)
    
    # Remove area/locality names that identify specific branches (NOT place-type words)
    # We're very conservative here - only remove known Bengaluru localities and address markers
    area_names = [
        r"\b(indiranagar|malleshwaram|koramangala|whitefield|jayanagar|banaswadi|"
        r"ulsoor|sankey|cubbon|residency|basavanagudi|forum|phoenix|garuda|central|axis|"
        r"mg|brigade|church)\b",  # Area names and common prefixes
    ]
    
    # Remove numeric addresses (12th Main, 100ft Road, etc.)
    address_patterns = [
        r"\d{1,2}(?:st|nd|rd|th)?\s*(?:main|cross|avenue)?\b",  # Numeric addresses
        r"\b(?:road|rd|street|st|lane|avenue|ave|place|close|cross|circle|branch|outlet|location)\b",  # Location words
    ]
    
    # First remove area names
    for pattern in area_names:
        normalized = re.sub(pattern, "", normalized, flags=re.IGNORECASE)
    
    # Then remove address patterns
    for pattern in address_patterns:
        normalized = re.sub(pattern, "", normalized, flags=re.IGNORECASE)
    
    # Collapse multiple spaces and strip
    normalized = re.sub(r"\s+", " ", normalized).strip()
    
    return normalized

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
        def calculate_score(z):
            age_pref = z.get("age_preferences", {}).get(age_group, 50)
            quality = z.get("quality_score", 50)
            # NEW: Add experience tag boost
            exp_tags = z.get("experience_tags", [])
            tag_boost = calculate_experience_tag_boost(age_group, exp_tags)
            # Combine: age_pref (0-100) + tag_boost (0-40) + quality (0-100)
            # This creates a score range of 0-240, strongly influenced by experience fit
            return age_pref + tag_boost + quality
        
        zones.sort(key=calculate_score, reverse=True)
    else:
        # Default: sort by quality score to prioritize better recommendations
        zones.sort(
            key=lambda z: z.get("quality_score", 50),
            reverse=True
        )
    
    # ===== DEDUPLICATION: Remove duplicate chain branches =====
    # Problem: Multiple branches of the same chain (Cafe Coffee Day at MG Road, Indiranagar, etc.)
    #          were all showing up, making the feed feel spammy and low-quality.
    # Solution: Keep only ONE instance per normalized chain name.
    #           Prioritize by highest quality score, then highest rating.
    # Maintains: Mode filtering, age personalization, diversity across categories
    seen_places = {}
    deduped_zones = []
    
    for zone in zones:
        # Normalize the place name to detect duplicates
        normalized_name = normalize_place_name(zone.get("title", ""))
        
        if normalized_name not in seen_places:
            # First encounter with this place name → keep it
            seen_places[normalized_name] = zone
            deduped_zones.append(zone)
        else:
            # Already seen this place → only replace if new one has better quality/rating
            existing = seen_places[normalized_name]
            new_quality = zone.get("quality_score", 50)
            existing_quality = existing.get("quality_score", 50)
            
            if new_quality > existing_quality:
                # Replace with higher quality version
                deduped_zones.remove(existing)
                seen_places[normalized_name] = zone
                deduped_zones.append(zone)
    
    return deduped_zones


@router.get("/popular-right-now", response_model=List[Zone])
async def fetch_popular_right_now(
    request: Request,
    chapter_id: Optional[str] = None,
    age_group: Optional[str] = None,
    limit: int = 10
):
    """
    Fetch a curated mix of Popular and Discover zones for the Popular Right Now section.
    Ensures balanced distribution across zone types and prioritizes high-quality recommendations.
    
    Quality-Based Curation:
    - Filters out extremely low-quality places (quality_score < 25)
    - Prioritizes high-quality places (quality_score > 70)
    - Uses quality as secondary sort after popularity/age
    
    Parameters:
    - chapter_id: Filter by specific chapter (optional)
    - age_group: Sort by age preferences ('teen', 'adult', 'senior') (optional)
    - limit: Maximum zones to return (default 10)
    
    Returns:
    - Balanced list of popular and discover zones with good mode distribution,
      prioritizing high-quality experiential recommendations
    """
    db = get_db(request)
    query = {}
    
    if chapter_id:
        query["chapter_id"] = chapter_id
    
    # Fetch all zones matching the query
    all_zones = []
    async for zone in db.zones.find(query):
        zone["id"] = str(zone["_id"])
        all_zones.append(zone)
    
    # FILTER: Remove extremely low-quality places (should not happen in db, but be safe)
    all_zones = [z for z in all_zones if z.get("quality_score", 50) >= 25]
    
    # Separate zones by type
    popular_zones = [z for z in all_zones if z.get("type") == "popular"]
    discover_zones = [z for z in all_zones if z.get("type") == "discover"]
    
    # Sort by age preference + quality + experience tags if specified
    if age_group and age_group in ["teen", "adult", "senior"]:
        def calculate_score(z):
            age_pref = z.get("age_preferences", {}).get(age_group, 50)
            quality = z.get("quality_score", 50)
            # NEW: Add experience tag boost
            exp_tags = z.get("experience_tags", [])
            tag_boost = calculate_experience_tag_boost(age_group, exp_tags)
            return age_pref + tag_boost + quality
        
        popular_zones.sort(key=calculate_score, reverse=True)
        discover_zones.sort(key=calculate_score, reverse=True)
    else:
        # Default: sort by quality score (high quality first)
        # Popular zones: sort by quality primarily
        popular_zones.sort(
            key=lambda z: z.get("quality_score", 50),
            reverse=True
        )
        # Discover zones: also sort by quality (don't sort by popularity_score in reverse)
        discover_zones.sort(
            key=lambda z: z.get("quality_score", 50),
            reverse=True
        )
    
    # ===== DEDUPLICATION: Remove duplicate chain branches =====
    # Before interleaving, deduplicate both popular and discover lists separately.
    # This ensures we get the best version of each chain while maintaining balanced distribution.
    def deduplicate_zones(zones_list):
        """
        Helper: Remove duplicate places from a zones list, keeping only the highest quality.
        """
        seen_places = {}
        deduped = []
        
        for zone in zones_list:
            normalized_name = normalize_place_name(zone.get("title", ""))
            
            if normalized_name not in seen_places:
                seen_places[normalized_name] = zone
                deduped.append(zone)
            else:
                # Replace if new one has better quality
                existing = seen_places[normalized_name]
                new_quality = zone.get("quality_score", 50)
                existing_quality = existing.get("quality_score", 50)
                
                if new_quality > existing_quality:
                    deduped.remove(existing)
                    seen_places[normalized_name] = zone
                    deduped.append(zone)
        
        return deduped
    
    # Apply deduplication to both popular and discover lists
    popular_zones = deduplicate_zones(popular_zones)
    discover_zones = deduplicate_zones(discover_zones)
    
    # Interleave popular and discover zones for balanced distribution
    # Ratio: ~60% popular, ~40% discover (more popular to ensure section isn't empty)
    curated = []
    popular_idx = 0
    discover_idx = 0
    popular_quota = max(1, (limit * 3) // 5)  # ~60% popular
    discover_quota = max(1, limit - popular_quota)  # ~40% discover
    
    # Add popular zones first (up to quota)
    while len(curated) < popular_quota and popular_idx < len(popular_zones):
        curated.append(popular_zones[popular_idx])
        popular_idx += 1
    
    # Fill remaining with discover zones
    while len(curated) < limit and discover_idx < len(discover_zones):
        curated.append(discover_zones[discover_idx])
        discover_idx += 1
    
    # If we don't have enough discover zones, pad with more popular zones
    while len(curated) < limit and popular_idx < len(popular_zones):
        curated.append(popular_zones[popular_idx])
        popular_idx += 1
    
    return curated[:limit]
