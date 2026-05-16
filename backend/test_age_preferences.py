"""
Test script to verify age-based personalization is working correctly.
Run this after seeding the database.
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
import certifi

load_dotenv()

async def test_age_preferences():
    MONGODB_URL = os.getenv("MONGODB_URL")
    if not MONGODB_URL:
        print("❌ Missing MONGODB_URL")
        return
    
    client = AsyncIOMotorClient(MONGODB_URL, tlsCAFile=certifi.where())
    db = client["citysense_db"]
    
    print("\n" + "="*70)
    print("TESTING AGE-BASED PERSONALIZATION")
    print("="*70)
    
    # Test 1: Check if zones have age_preferences
    print("\n[Test 1] Checking if zones have age_preferences field...")
    zones_with_prefs = await db.zones.count_documents({"age_preferences": {"$exists": True}})
    total_zones = await db.zones.count_documents({})
    print(f"✅ Zones with age_preferences: {zones_with_prefs}/{total_zones}")
    
    if zones_with_prefs == 0:
        print("❌ FAIL: No zones have age_preferences!")
        return
    
    # Test 2: Sample zones from each mode
    print("\n[Test 2] Sampling zones from each mode...")
    for mode in ['calm', 'comfort', 'explore']:
        sample = await db.zones.find_one({"mode": mode, "age_preferences": {"$exists": True}})
        if sample:
            prefs = sample.get("age_preferences", {})
            print(f"\n  📍 {mode.upper()} MODE - {sample['title']}")
            print(f"     Teen score:   {prefs.get('teen', 'N/A')}")
            print(f"     Adult score:  {prefs.get('adult', 'N/A')}")
            print(f"     Senior score: {prefs.get('senior', 'N/A')}")
        else:
            print(f"  ❌ No zones found in {mode} mode with age_preferences")
    
    # Test 3: Verify sorting logic (simulate backend behavior)
    print("\n[Test 3] Testing sorting logic for each age group...")
    
    for mode in ['calm', 'comfort', 'explore']:
        for age_group in ['teen', 'adult', 'senior']:
            zones_cursor = db.zones.find({"mode": mode, "age_preferences": {"$exists": True}})
            zones_list = await zones_cursor.to_list(length=10)
            
            # Sort like backend does
            zones_list.sort(
                key=lambda z: z.get("age_preferences", {}).get(age_group, 50),
                reverse=True
            )
            
            if len(zones_list) >= 2:
                top1 = zones_list[0]
                top2 = zones_list[1]
                score1 = top1.get("age_preferences", {}).get(age_group, 50)
                score2 = top2.get("age_preferences", {}).get(age_group, 50)
                
                print(f"\n  {mode.upper()} mode - {age_group.upper()}:")
                print(f"    1️⃣  {top1['title']} (score: {score1})")
                print(f"    2️⃣  {top2['title']} (score: {score2})")
    
    # Test 4: Verify age preferences have realistic values
    print("\n[Test 4] Checking age preference value ranges...")
    bad_scores = await db.zones.count_documents({
        "$or": [
            {"age_preferences.teen": {"$lt": 0}},
            {"age_preferences.teen": {"$gt": 100}},
            {"age_preferences.adult": {"$lt": 0}},
            {"age_preferences.adult": {"$gt": 100}},
            {"age_preferences.senior": {"$lt": 0}},
            {"age_preferences.senior": {"$gt": 100}},
        ]
    })
    
    if bad_scores == 0:
        print("✅ All age preference scores are in valid range (0-100)")
    else:
        print(f"❌ Found {bad_scores} zones with invalid score ranges!")
    
    # Test 5: Check fallback zones
    print("\n[Test 5] Checking fallback zone data...")
    fallback_count = await db.zones.count_documents({"id": {"$regex": "^z"}})
    print(f"✅ Fallback zones in database: {fallback_count}")
    
    fallback_sample = await db.zones.find_one({"id": {"$regex": "^z"}})
    if fallback_sample:
        print(f"   Sample: {fallback_sample['title']} ({fallback_sample['mode']} mode)")
        print(f"   Age preferences: {fallback_sample.get('age_preferences', 'MISSING!')}")
    
    # Test 6: Verify OSM zones
    print("\n[Test 6] Checking OSM-fetched zone data...")
    osm_count = await db.zones.count_documents({"id": {"$regex": "^osm_"}})
    print(f"✅ OSM zones in database: {osm_count}")
    
    osm_sample = await db.zones.find_one({"id": {"$regex": "^osm_"}})
    if osm_sample:
        print(f"   Sample: {osm_sample['title']} ({osm_sample['mode']} mode)")
        print(f"   Age preferences: {osm_sample.get('age_preferences', 'MISSING!')}")
    else:
        print("   (No OSM zones found - likely fell back to hardcoded data)")
    
    print("\n" + "="*70)
    print("✅ AGE-BASED PERSONALIZATION TESTS COMPLETE")
    print("="*70 + "\n")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(test_age_preferences())
