from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import json
import uuid
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash
from square import Square
import httpx
import smtplib
from email.message import EmailMessage

# 環境変数の読み込み
load_dotenv()

# Read Square environment variable
SQUARE_ENVIRONMENT = os.getenv('SQUARE_ENVIRONMENT', 'sandbox')

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False

# CORS設定（React側からのアクセスを許可）
CORS(app, origins=['http://localhost:3000'])

SQUARE_ACCESS_TOKEN = os.getenv('SQUARE_ACCESS_TOKEN')
SQUARE_LOCATION_ID = os.getenv('SQUARE_LOCATION_ID')

# SMTP settings
SMTP_HOST = os.getenv('SMTP_HOST')
SMTP_PORT = int(os.getenv('SMTP_PORT', 587))
SMTP_USER = os.getenv('SMTP_USER')
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD')
EMAIL_FROM = os.getenv('EMAIL_FROM')  # e.g. "no-reply@yourdomain.com"
def send_order_email(to_address, order):
    msg = EmailMessage()
    msg['Subject'] = f"ご注文確認: {order['order_id']}"
    msg['From'] = EMAIL_FROM
    msg['To'] = to_address
    body = f"""\
{order['email']} 様、

ご注文を承りました。以下の内容で確認させていただきます。

注文ID: {order['order_id']}
合計金額: ¥{order['amount']}
ステータス: {order['status']}

商品:
"""
    for item in order['items']:
        body += f"- 商品ID {item['id']} × {item['qty']}\n"
    body += "\nありがとうございました。"

    msg.set_content(body)
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as smtp:
        smtp.starttls()
        smtp.login(SMTP_USER, SMTP_PASSWORD)
        smtp.send_message(msg)



user_Data_file = os.path.join(os.path.dirname(__file__), 'userDatabase.json')
product_data_file = os.path.join(os.path.dirname(__file__), 'productDatabase.json')
order_data_file = os.path.join(os.path.dirname(__file__), 'order.json')

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
    def __init__(self, id, price, name, displayname):
        self.id = id
        self.price = price
        self.name = name
        self.displayname = displayname

#Function to load and save data into json store
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
    if not os.path.exists(product_data_file):
        raise FileNotFoundError(f"Product database not found: {product_data_file}")
    with open(product_data_file, 'r', encoding='utf-8') as f:
        product_list = json.load(f)
    return [
        Product(item['id'], item['price'], item.get('name', ''), item.get('displayname', ''))
        for item in product_list
    ]

def load_orders():
    # Ensure the JSON file exists
    if not os.path.exists(order_data_file) or os.path.getsize(order_data_file) == 0:
        with open(order_data_file, 'w', encoding='utf-8') as f:
            json.dump([], f, ensure_ascii=False, indent=2)
    with open(order_data_file, 'r', encoding='utf-8') as f:
        return json.load(f)
    
def save_orders(orders):
    # orders is expected to be a list of order dicts
    with open(order_data_file, 'w', encoding='utf-8') as f:
        json.dump(orders, f, ensure_ascii=False, indent=2)


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

@app.route('/api/account', methods=['GET', 'POST'])
def account_info():
    users = load_data()
    if request.method == 'POST':
        data = request.get_json() or {}
        email = data.get('email')
    else:
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
    user.phone_number = data.get('phone')
    user.address_num = data.get('address_num')
    user.address_1 = data.get('address_1')
    user.address_2 = data.get('address_2')

    save_data(users)
    return jsonify ({
        'status': 'Success',
        'email': user.email,
        'id': user.id,
        'phone_number': user.phone_number,
        'address_num': user.address_num,
        'address_1': user.address_1,
        'address_2': user.address_2
    })

@app.route('/api/products',methods=['GET'])
def products_info():
    products = load_products()

    result = [{'id': p.id, 'price': p.price, 'name': p.displayname} for p in products]
    return jsonify (result)

@app.route('/api/calc_amount', methods=['POST'])
def calc_amount():
    products = load_products()
    product_map = {p.id: p for p in products}

    data = request.get_json() or {}
    items = data.get('items', [])
    total_amount = 0

    for item in items:
        prod_id = item.get('id')
        qty = item.get('qty', 1)
        product = product_map.get(prod_id)
        if product:
            total_amount += product.price * qty
    
    shipping_fee = 0

    for item in items:
        prod_id = item.get('id')
        if 1 <= prod_id <= 6:
            shipping_fee = 250
            break

    total_amount += shipping_fee

    return jsonify({
        'amount': total_amount,
        'shipping_fee': shipping_fee
        })

@app.route('/api/checkout', methods=['POST'])
def create_checkout():
    print(SQUARE_ACCESS_TOKEN)
    print("DEBUG - location:", SQUARE_LOCATION_ID)
    data = request.get_json() or {}
    items = data.get('items', [])
    amount = data.get('amount', 0)
    print("DEBUG - payload items:", items, "amount:", amount)
    print("DEBUG - Square environment:", SQUARE_ENVIRONMENT)
    orders = load_orders()
    users = load_data()
    email = data.get('email')
    if email and email in users:
        email = data.get('email')
    else:
        email = 'GUEST'

    order_id = str(uuid.uuid4())

    new_order = {
        'order_id': order_id,
        'email': email,
        'items': items,
        'amount': amount,
        'status': 'PENDING'
    }

    orders.append(new_order)
    save_orders(orders)

        # 注文確認メールを送信
    try:
        if email and email != 'GUEST':
            send_order_email(email, new_order)
    except Exception as e:
        print("メール送信エラー:", e)
    # Create Payment Links via direct HTTP request
    headers = {
        "Authorization": f"Bearer {SQUARE_ACCESS_TOKEN}",
        "Content-Type": "application/json",
        "Square-Version": "2025-06-19"
    }
    payload = {
        "idempotency_key": order_id,
        "quick_pay": {
            "name": "Order Payment",
            "price_money": {
                "amount": amount,
                "currency": "JPY"
            },
            "location_id": SQUARE_LOCATION_ID,
            "redirect_url": "http://localhost:3000/comfirmation_payment"
        }
    }
    # Determine Square Payment Links endpoint
    if SQUARE_ENVIRONMENT == 'production':
        api_url = "https://connect.squareup.com/v2/online-checkout/payment-links"
    else:
        api_url = "https://connect.squareupsandbox.com/v2/online-checkout/payment-links"
    resp = httpx.post(
        api_url,
        headers=headers,
        json=payload
    )
    if resp.status_code == 200:
        checkout_url = resp.json()["payment_link"]["url"]
        return jsonify({"checkoutUrl": checkout_url})
    else:
        return jsonify({"error": resp.json()}), resp.status_code

@app.route('/api/history', methods=['GET'])
def get_history():
    users = load_data()
    orders = load_orders()
    if not email:
        return jsonify({
            'status': 'Failed',
            'message': 'User not found'
        })
    email = request.args.get('email')
    matched = [o for o in orders if o.get('email') == email]
    return jsonify({
        'status': 'Success',
        'orders': matched
    })

@app.route('/api/complete_order', methods=['POST'])
def complete_order():
    orders = load_orders
    data = request.get_json() or {}
    order_id = data.get('order_id')
    status = data.get('status')
    update = False

    for order in orders:
        if order['order_id'] == order_id:
            order['status'] == status
            update = True
            break

    save_orders(orders)

    if update == True:
        return jsonify ({
            'status': 'Success',
            'order_id': order_id,
            'new_status': status
        })
    elif not update:
        return jsonify ({
            'status': 'Failed',
            'message': 'Order not found'
        }), 404



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)