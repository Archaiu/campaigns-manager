#!/usr/bin/env python3
"""
Skrypt do dodawania nowych użytkowników do bazy danych.

Użycie:
    python add_user.py <username> <password>

Przykład:
    python add_user.py john mysecretpass123
"""

import sys
import os
from pymongo import MongoClient
from werkzeug.security import generate_password_hash

def add_user(username, password):
    """Dodaje nowego użytkownika do bazy danych."""
    
    # Połączenie z MongoDB
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
    client = MongoClient(MONGO_URI)
    db = client['campaigns_db']
    users_collection = db['users']
    
    # Sprawdź czy użytkownik już istnieje
    existing_user = users_collection.find_one({"username": username})
    if existing_user:
        print(f"❌ Błąd: Użytkownik '{username}' już istnieje w bazie!")
        return False
    
    # Pobierz ostatnie ID
    last_user = users_collection.find_one(sort=[("_id", -1)])
    new_id = last_user["_id"] + 1 if last_user else 1
    
    # Zahashuj hasło
    hashed_password = generate_password_hash(password)
    
    # Dodaj użytkownika
    new_user = {
        "_id": new_id,
        "username": username,
        "password": hashed_password
    }
    
    users_collection.insert_one(new_user)
    print(f"✓ Pomyślnie dodano użytkownika '{username}' (ID: {new_id})")
    return True

def main():
    if len(sys.argv) != 3:
        print("Użycie: python add_user.py <username> <password>")
        print("Przykład: python add_user.py john mysecretpass123")
        sys.exit(1)
    
    username = sys.argv[1]
    password = sys.argv[2]
    
    if not username or not password:
        print("❌ Błąd: Nazwa użytkownika i hasło nie mogą być puste!")
        sys.exit(1)
    
    if len(password) < 6:
        print("⚠️  Uwaga: Hasło jest bardzo krótkie (zalecane minimum 6 znaków)")
    
    try:
        add_user(username, password)
    except Exception as e:
        print(f"❌ Błąd podczas dodawania użytkownika: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
