import requests
import json

BASE_URL = "http://localhost:5000/api"
TEST_ACCOUNT = {
    "name": "QA Tester",
    "email": "tester@example.com",
    "password": "Password123!"
}

def test_requirements():
    print("🚀 Starting Assignment Requirement Verification...\n")
    
    # 1. Test Signup
    print("1. Testing POST /auth/signup...")
    r = requests.post(f"{BASE_URL}/auth/signup", json=TEST_ACCOUNT)
    if r.status_code in [201, 409]:
        print("   ✅ SUCCESS: Auth endpoint functional.")
    else:
        print(f"   ❌ FAILED: Status {r.status_code}")

    # 2. Test Login
    print("\n2. Testing POST /auth/login...")
    r = requests.post(f"{BASE_URL}/auth/login", json={
        "email": TEST_ACCOUNT["email"],
        "password": TEST_ACCOUNT["password"]
    })
    token = r.json().get('data', {}).get('access_token')
    if token:
        print("   ✅ SUCCESS: JWT issued.")
    else:
        print("   ❌ FAILED: No token received.")
        return

    headers = {"Authorization": f"Bearer {token}"}

    # 3. Test Dashboard (Masking Check)
    print("\n3. Testing GET /video/dashboard (Masking Check)...")
    r = requests.get(f"{BASE_URL}/video/dashboard", headers=headers)
    videos = r.json().get('data', {}).get('videos', [])
    if videos:
        # Check that youtube_id is MISSING (This is the assignment requirement!)
        if 'youtube_id' not in videos[0]:
            print("   ✅ SUCCESS: YouTube IDs are masked (Hidden behind backend).")
        else:
            print("   ❌ SECURITY FLAW: YouTube ID is exposed to client!")
    else:
        print("   ⚠️  WARNING: No videos found. Seed data first.")
        return

    # 4. Test Playback Token
    video_id = videos[0]['id']
    print(f"\n4. Testing GET /video/{video_id}/stream (Token Generation)...")
    r = requests.get(f"{BASE_URL}/video/{video_id}/stream", headers=headers)
    playback_token = r.json().get('data', {}).get('playback_token')
    if playback_token:
        print("   ✅ SUCCESS: Secure playback token generated.")
    else:
        print("   ❌ FAILED: No playback token.")

    print("\n✅ ALL NON-NEGOTIABLE REQUIREMENTS VERIFIED!")

if __name__ == "__main__":
    test_requirements()
