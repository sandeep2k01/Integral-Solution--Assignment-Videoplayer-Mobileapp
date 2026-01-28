import pymongo
import sys

uri = "mongodb+srv://testadmin:IntegralApp2026@video-app.1djhrnp.mongodb.net/video_app?retryWrites=true&w=majority&appName=video-app"

try:
    print("Connecting to MongoDB...")
    client = pymongo.MongoClient(uri, serverSelectionTimeoutMS=5000)
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(f"Connection failed: {e}")
