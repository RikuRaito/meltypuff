from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import json
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash

# 環境変数の読み込み
load_dotenv()

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False

# CORS設定（React側からのアクセスを許可）
CORS(app, origins=['http://localhost:3000'])

user_Data_file = os.path.join(os.path.dirname(__file__), 'userDatabase.json')
product_data_file = os.path.join(os.path.dirname(__file__), 'productDatabase.json')

class User:
    def __init__(self, id, email,phone_number, password_hash,address_num,address_1,address_2):
        self.id = id
        self.email = email
        self.phone_number = phone_number
        self.password_hash = password_hash
        self.address_num = address_num
        self.address_1 = address_1
        self.address_2 = address_2

    @classmethod
    def from_dict(cls, data):
        return cls(
            data['id'],
            data['email'],
            data.get('phone_number'),
            data['password_hash'],
            data.get('address_num'),
            data.get('address_1'),
            data.get('address_2')
            )

    def to_dict(self):
        d = {
            'id': self.id,
            'email': self.email,
            'password_hash': self.password_hash
        }
        if self.phone_number is not None:
            d['phone_number'] = self.phone_number
        if self.address_num is not None:
            d['address_num'] = self.address_num
        if self.address_1 is not None:
            d['address_1'] = self.address_1
        if self.address_2 is not None:
            d['address_2'] = self.address_2
        return d
    
    def auth(self,password):
        return check_password_hash(self.password_hash, password)
    

class Product:
    def __init__(self, id, price, name):
        self.id = id
        self.price = price
        self.name = name


def load_data():
    if not os.path.exists(user_Data_file) or os.path.getsize(user_Data_file) == 0:
        with open(user_Data_file, 'w', encoding='utf-8') as f:
            json.dump({}, f, ensure_ascii=False, indent=2)
    with open(user_Data_file, 'r', encoding='utf-8') as f:
        raw = json.load(f)
        # Convert each record into a User instance
        return {email: User.from_dict(info) for email, info in raw.items()}

def save_data(data):
    # Convert User instances back to plain dicts
    serializable = {email: user.to_dict() for email, user in data.items()}
    with open(user_Data_file, 'w', encoding='utf-8') as f:
        json.dump(serializable, f, ensure_ascii=False, indent=2)

def load_products():
    product_data_file = Product.product_data_file
    if not os.path.exists(product_data_file):
        raise FileNotFoundError(f"Product database not found: {product_data_file}")
        
    with open(product_data_file, 'r', encoding='utf-8') as f:
        product_list = json.load(f)
    
    return [
        Product(item['id'], item['price'], item.get['name', ''])
        for item in product_list
    ]

# ルートエンドポイント
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "OK", "message": "Flask API is running"})

# データ取得エンドポイント
@app.route('/api/data', methods=['GET'])
def get_data():
    data = load_data()
    return jsonify({'data':data})

# データ作成エンドポイント
@app.route('/api/data', methods=['POST'])
def create_data():
    data = load_data()
    new_item = request.get_json()
    new_item['id'] = max((i['id'] for i in data), default=0) + 1
    data.append(new_item)
    save_data(data)
    return jsonify({"message": "データが作成されました", "data": new_item}), 201

# 特定データ取得エンドポイント
@app.route('/api/data/<int:item_id>', methods=['GET'])
def get_item(item_id):
    data = load_data()
    item = next((i for i in data if i['id'] == item_id), None)
    return (jsonify({"data": item}), 200) if item else (jsonify({"error": "データが見つかりません"}), 404)

@app.route('/api/signup', methods=['POST'])
def signup():
    load_data()
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    password_hash = generate_password_hash(password)

    users = load_data()
    if email in users:
        return jsonify({
            'status': 'Failed',
            'message': 'Email already registered'
        }), 400
    new_id = len(users) + 1
    # Create and store a new User instance
    new_user = User(new_id, email, "", password_hash, "", "", "")
    users[email] = new_user
    save_data(users)
    return jsonify({
        'status': 'Success',
        'message': 'Registered successfully',
        'user': new_user.to_dict()
    }), 201

@app.route('/api/login', methods=['POST'])
def login():
    users = load_data()
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')
    user = users.get(email)

    if not user:
        return jsonify ({
            'Status': 'Failed',
            'message': 'User not found'
        }),404

    if user.auth(password):
        return jsonify ({
            'status': 'Success',
            'message': 'Login Successfully'
        })
    else:
        return jsonify ({
            'status': 'Failed',
            'message': 'Incorrect'
        })
    
@app.route('/api/update_password')
def update_password():
    users = load_data()
    data = request.get_json() or {}
    email = data.get('email')
    new_password = data.get('new_password')
    user = users[email]

    if not users[email]:
        return jsonify ({
            'status': 'Failed',
            'message': 'User not found'
        }),404
    
    new_hash = generate_password_hash(new_password)
    user.password_hash = new_hash
    save_data(users)
    return jsonify ({
        'status': 'Success',
        'message': 'Password updated'
    }), 200

@app.route('/api/account', methods=['GET'])
def account_info():
    users = load_data()
    email = request.args.get('email')
    user= users.get(email)
    if not user:
        return jsonify ({
            'status': 'Failed',
            'message': 'User not found'
        }), 404

    return jsonify ({
        'status': 'Success',
        'email': email,
        'id': user.id,
        'phone_number': user.phone_number,
        'address_num': user.address_num,
        'address_1': user.address_1,
        'address_2': user.address_2
    })

@app.route('/api/account_update', methods=['POST'])
def account_update():
    users = load_data()
    data = request.get_json()
    email = data.get('email')
    if not email or email not in users:
        return jsonify ({
            'status': 'Failed',
            'message': 'User not found'
        }),404
    
    user = users[email]
    user.phone_number = data.get('phone_number')
    user.address_num = data.get('address_num')
    user.address_1 = data.get('address_1')
    user.address_2 = data.get('address_2')

    save_data(users)
    return jsonify ({
        'status': 'Success',
        'email': user.email,
        'id': user.id,
        'address_num': user.address_num,
        'address_1': user.address_1,
        'address_2': user.address_2
    })



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)