from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient, ReturnDocument
import os
import jwt
import datetime
import logging
from werkzeug.security import check_password_hash, generate_password_hash

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)



app = Flask(__name__)
CORS(app)

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://db:27017/')
DATABASE_NAME = os.getenv('DATABASE_NAME', 'campaigns_db')

logger.info(f"Connecting to MongoDB: {MONGO_URI}")
logger.info(f"Using database: {DATABASE_NAME}")

client = MongoClient(MONGO_URI)
db = client[DATABASE_NAME]
campaigns_collection = db['campaigns']
users_collection = db['users']

def token_required(f):
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({"error": "Brak tokenu"}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            user_id = int(data['user_id'])
            current_user = users_collection.find_one({"_id": user_id})
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token wygasł"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Nieprawidłowy token"}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated


@app.route('/')
def home():
    return jsonify({"message": "Flask Backend is running!"}),201

@app.route('/api/campaigns', methods=['GET'], endpoint='get_campaigns')
@token_required
def get_campaigns(current_user):
    campaigns = list(campaigns_collection.find({"name": current_user["username"]}))
    return jsonify(campaigns)

@app.route('/api/campaigns', methods=['POST'], endpoint='create_campaign')
@token_required
def create_campaign(current_user):
    last_campaign = campaigns_collection.find_one(sort=[("_id", -1)])
    new_id = last_campaign["_id"] + 1 if last_campaign else 0
    data = request.json
    data["_id"] = new_id
    data["name"] = current_user["username"]
    campaigns_collection.insert_one(data)
    return jsonify({"message": "Campaign created successfully", "_id": new_id}), 201

@app.route('/api/campaigns/<int:campaign_id>', methods=['PUT', 'PATCH'], endpoint='update_campaign')
@token_required
def update_campaign(current_user, campaign_id):
    data = request.json
    campaign = campaigns_collection.find_one_and_replace(
        {"_id": data["_id"], "name": current_user["username"]},
        data,
        return_document=ReturnDocument.AFTER
    )
    if not campaign:
        return jsonify({"message": "There is no matching campaign in database"}), 404
    return jsonify({"message": "Campaign changed with success", "campaign" : campaign}), 201

@app.route('/api/campaigns/<int:campaign_id>', methods=['DELETE'], endpoint='delete_campaign')
@token_required
def delete_campaign(current_user, campaign_id):
    result = campaigns_collection.delete_one({"_id": campaign_id, "name": current_user["username"]})
    if result.deleted_count > 0:
        return jsonify({"message": "Campaign deleted successfully"})
    return jsonify({"message": "Campaign not found"}), 404

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    logger.info(f"Login attempt for username: {username}")

    if not username or not password:
        logger.warning("Login failed: missing username or password")
        return jsonify({"error": "Brak nazwy użytkownika lub hasła"}), 400

    user = users_collection.find_one({"username": username})
    
    if not user:
        logger.warning(f"Login failed: user '{username}' not found in database")
        logger.debug(f"Available users: {list(users_collection.find({}, {'username': 1, '_id': 1}))}")
        return jsonify({"error": "Nieprawidłowa nazwa użytkownika lub hasło"}), 401
    
    logger.debug(f"User found: {user.get('username')} (ID: {user.get('_id')})")
    
    if not check_password_hash(user['password'], password):
        logger.warning(f"Login failed: incorrect password for user '{username}'")
        return jsonify({"error": "Nieprawidłowa nazwa użytkownika lub hasło"}), 401

    logger.info(f"Login successful for user: {username}")
    
    token = jwt.encode({
        'user_id': str(user['_id']),
        'username': user['username'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }, app.config['SECRET_KEY'], algorithm='HS256')

    return jsonify({
        "token": token,
        "user": {
            "_id": str(user['_id']),
            "username": user['username']
        }
    }), 200

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    logger.info(f"Registration attempt for username: {username}")

    if not username or not password:
        logger.warning("Registration failed: missing username or password")
        return jsonify({"error": "Brak nazwy użytkownika lub hasła"}), 400

    if len(password) < 3:
        return jsonify({"error": "Hasło musi mieć minimum 3 znaki"}), 400

    existing_user = users_collection.find_one({"username": username})
    if existing_user:
        logger.warning(f"Registration failed: user '{username}' already exists")
        return jsonify({"error": "Użytkownik o tej nazwie już istnieje"}), 400

    last_user = users_collection.find_one(sort=[("_id", -1)])
    new_id = last_user["_id"] + 1 if last_user else 1

    new_user = {
        "_id": new_id,
        "username": username,
        "password": generate_password_hash(password)
    }

    users_collection.insert_one(new_user)
    logger.info(f"User '{username}' registered successfully (ID: {new_id})")

    return jsonify({"message": "Użytkownik został utworzony"}), 201


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
