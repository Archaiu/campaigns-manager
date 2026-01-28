#!/usr/bin/env python3
import sys
import os
from pymongo import MongoClient
from werkzeug.security import generate_password_hash

def add_user(username, password):
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
    DATABASE_NAME = os.getenv('DATABASE_NAME', 'campaigns_db')
    
    client = MongoClient(MONGO_URI)
    db = client[DATABASE_NAME]
    users_collection = db['users']
    
    if users_collection.find_one({"username": username}):
        print(f"User '{username}' already exists")
        return False
    
    last_user = users_collection.find_one(sort=[("_id", -1)])
    new_id = last_user["_id"] + 1 if last_user else 1
    
    new_user = {
        "_id": new_id,
        "username": username,
        "password": generate_password_hash(password)
    }
    
    users_collection.insert_one(new_user)
    print(f"User '{username}' added (ID: {new_id})")
    return True

def main():
    if len(sys.argv) != 3:
        print("Usage: python add_user.py <username> <password>")
        sys.exit(1)
    
    add_user(sys.argv[1], sys.argv[2])

if __name__ == "__main__":
    main()
