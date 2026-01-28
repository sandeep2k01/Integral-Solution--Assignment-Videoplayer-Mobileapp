import pymongo
import sys

uri = "mongodb+srv://sandeepdamera0596_db_user:%40Sandeep96@video-app.1djhrnp.mongodb.net/?retryWrites=true&w=majority&appName=video-app"

try:
    client = pymongo.MongoClient(uri, serverSelectionTimeoutMS=5000)
    # The ismaster command is cheap and does not require auth.
    client.admin.command('ismaster')
    print("Connection Successful!")
except Exception as e:
    print(f"Connection Failed: {e}")
