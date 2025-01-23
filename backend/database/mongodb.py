# database/mongodb.py
import motor.motor_asyncio  # For asynchronous MongoDB interaction
from pymongo import MongoClient
# Replace with your MongoDB connection string
MONGODB_URL = "mongodb://user:password@host:27017/your_database" #UPDATE THIS ONCE SET UP!
# use this to connect without async
syncClient = MongoClient(MONGODB_URL)
#Async Client (used to connect to an asynchronous client
asyncClient = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URL)
#Database name
DATABASE_NAME = "your_database"
#Access to DB
syncDB = syncClient[DATABASE_NAME]
asyncDB = asyncClient[DATABASE_NAME]

# Helper function to get MongoDB database (synchronous)
def get_mongodb_sync():
    return syncDB

# Helper function to get MongoDB database (asynchronous)
async def get_mongodb_async():
    return asyncDB