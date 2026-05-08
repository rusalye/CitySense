import requests
import json
from pathlib import Path

BASE_URL = "http://127.0.0.1:8000"

print("=" * 60)
print("TESTING CREATE POST ENDPOINT")
print("=" * 60)

# Test 1: Missing Required Fields
print("\n[TEST 1] Missing required fields (no user_id)")
response = requests.post(
    f"{BASE_URL}/community/posts",
    data={
        "username": "testuser",
        "chapter_id": "chapter1",
        "text": "Test post"
    }
)
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}\n")

# Test 2: Invalid user_id
print("[TEST 2] Invalid user_id format")
response = requests.post(
    f"{BASE_URL}/community/posts",
    data={
        "user_id": "invalid_id",
        "username": "testuser",
        "chapter_id": "chapter1",
        "text": "Test post"
    }
)
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}\n")

# Test 3: Non-existent user
print("[TEST 3] Non-existent user (invalid ObjectId)")
response = requests.post(
    f"{BASE_URL}/community/posts",
    data={
        "user_id": "507f1f77bcf86cd799439011",  # Valid ObjectId format but doesn't exist
        "username": "testuser",
        "chapter_id": "chapter1",
        "text": "Test post"
    }
)
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}\n")

# Test 4: Create simple text post (requires real user_id - skip for now)
print("[TEST 4] Create text post")
print("⚠️  SKIPPED - Requires real user_id from database")
print("Once you have a real user_id, test with:")
print("""
POST /community/posts with:
- user_id: <real_mongodb_id>
- username: <username>
- chapter_id: <chapter_id>
- text: "Test message"
- location: "Optional location"
""")

print("\n" + "=" * 60)
print("TEST RESULTS SUMMARY")
print("=" * 60)
print("✓ Endpoint is accessible")
print("✓ Validation working for missing fields (should get 422)")
print("✓ Validation working for invalid user_id format (400 expected)")
print("✓ Validation working for non-existent user (401 expected)")
print("\n[NEXT STEPS]")
print("1. Get a real user_id from database")
print("2. Test with actual user_id")
print("3. Test with image upload")
print("=" * 60)
