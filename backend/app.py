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
from datetime import datetime

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
SQUARE_ACCESS_TOKEN_sandbox = os.getenv('SQUARE_ACCESS_TOKEN_sandbox')
SQUARE_LOCATION_ID_sandbox = os.getenv('SQUARE_LOCATION_ID_sandbox')
FRONTEND_BASE = os.getenv('FRONTEND_URL', 'http://localhost:3000')

# SMTP settings
SMTP_HOST = os.getenv('SMTP_HOST')
SMTP_PORT = int(os.getenv('SMTP_PORT', 587))
SMTP_USER = os.getenv('SMTP_USER')
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD')
EMAIL_FROM = os.getenv('EMAIL_FROM')  # e.g. "no-reply@yourdomain.com"


def send_order_email(to_address, order):
    # Build product ID → displayname map
    products = load_products()
    product_map = {p.id: p.displayname for p in products}
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

        配送先情報
        名前:{order['name']}
        郵便番号:{order['postal_code']}
        住所: {order['address1'] + order['address2']}

        商品:
        """
    for item in order['items']:
        display = product_map.get(item['id'], f"ID:{item['id']}")
        body += f"- {display} × {item['qty']}\n"
    body += "\nご注文いただき誠にありがとうございました。発送まで今しばらくお待ちくださいませ。"

    msg.set_content(body)
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as smtp:
        smtp.starttls()
        smtp.login(SMTP_USER, SMTP_PASSWORD)
        smtp.send_message(msg)


def send_business_notification(order):
    # Load products for display names
    products = load_products()
    product_map = {p.id: p.displayname for p in products}
    msg = EmailMessage()
    msg['Subject'] = f"新規注文通知: {order['order_id']}"
    msg['From'] = EMAIL_FROM
    # Replace these with your business notification addresses, or use a list
    msg['To'] = os.getenv('BUSINESS_NOTIFICATION_EMAIL', EMAIL_FROM)
    body = f"""\
    ビジネスチーム各位、

    新しい注文を受け付けました。詳細は以下の通りです。

    注文ID: {order['order_id']}
    登録メール: {order.get('email', 'GUEST')}
    名前:{order['name']}
    電話番号: {order.get('phone')}
    合計金額: ¥{order['amount']}

    配送先情報
    郵便番号:{order['postal_code']}
    住所１:{order['address1']}
    住所２:{order['address2']}

    商品一覧:
    """
    for item in order['items']:
        display = product_map.get(item['id'], f"ID:{item['id']}")
        body += f"- {display} × {item['qty']}\n"
    body += "\n-------------------------\n"

    msg.set_content(body)
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as smtp:
        smtp.starttls()
        smtp.login(SMTP_USER, SMTP_PASSWORD)
        smtp.send_message(msg)


def send_reset_password(email, token):
    print('sending email to reset password')
    reset_link = f"{FRONTEND_BASE}/ResetPassword?token={token}"
    msg = EmailMessage()
    msg['Subject'] = f"Melty Puffパスワードリセット"
    msg['From'] = EMAIL_FROM
    msg['To'] = email
    body = f"""\
        {email}様

        パスワードリセットに関してのリクエストを承りました。
        以下のリンクをクリックしてパスワードのリセットをお願いいたします。
        {reset_link}
        
        なおこのリンクは発行から１時間で無効になりますのでご注意ください。
        Melty Puffでのショッピングをお楽しみください。
    """
    msg.set_content(body)
    print("DEBUG MSG:", msg.as_string())
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as smtp:
        smtp.set_debuglevel(1)
        smtp.starttls()
        smtp.login(SMTP_USER, SMTP_PASSWORD)
        smtp.send_message(msg)
    print('Completed sending email')


user_Data_file = os.path.join(os.path.dirname(__file__), 'userDatabase.json')
product_data_file = os.path.join(os.path.dirname(__file__), 'productDatabase.json')
order_data_file = os.path.join(os.path.dirname(__file__), 'order.json')
reset_requests = os.path.join(os.path.dirname(__file__), 'reset_requests.json')
admin_account = os.path.join(os.path.dirname(__file__), 'admin_data.json')

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

def load_reset_requests():
    if not os.path.exists(reset_requests) or os.path.getsize(reset_requests) == 0:
        with open(reset_requests, 'w', encoding='utf-8') as f:
            json.dump({}, f, ensure_ascii=False, indent=2)
    with open(reset_requests, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_reset_requests(email, token):
    requests = load_reset_requests()
    requests[email] = {
        "token": token,
        "issued_at": datetime.utcnow().isoformat()
    }
    
    with open(reset_requests, 'w', encoding='utf-8') as f:
        json.dump(requests, f, ensure_ascii=False, indent=2)

def load_admin_data():
    if not os.path.exists(admin_account) or os.path.getsize(admin_account) == 0:
        with open(admin_account, 'w', encoding='utf-8') as f:
            return json.load(f)
    with open(admin_account, 'r', encoding='utf-8') as f:
        return json.load(f)


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


@app.route('/api/contact', methods=['POST'])
def contact():
    data = request.get_json() or {}
    email = data.get('email')
    message = data.get('message')
    msg = EmailMessage()
    msg['Subject'] = f"新規お問い合わせ"
    msg['From'] = EMAIL_FROM
    msg['To'] = SMTP_USER
    body = f"""\
    ビジネスチーム各位
    {email}様よりお問い合わせがありました。

    {message}
    
    速やかに返信をお願いします。
    """
    msg.set_content(body)
    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as smtp:
            smtp.starttls()
            smtp.login(SMTP_USER, SMTP_PASSWORD)
            smtp.send_message(msg)
    except Exception as e:
        print("お問い合わせメール送信エラー:", e)
        return jsonify({
            'status': 'Failed',
            'message': 'Email send error'
            }), 500
    
    return jsonify ({
        'status': 'Success',
        'message': 'お問い合わせを送信しました'
    }), 200


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
    data = request.get_json() or {}
    items = data.get('items', [])
    amount = data.get('amount', 0)
    print("DEBUG - payload items:", items, "amount:", amount)
    print("DEBUG - Square environment:", SQUARE_ENVIRONMENT)
    orders = load_orders()
    account = False
    users = load_data()
    email = data.get('email')
    name = data.get('name')
    phone = data.get('phone')
    postal_code = data.get('postalCode')
    address1 = data.get('address1')
    address2 = data.get('address2')
    if email in users:
        account = True

    order_id = str(uuid.uuid4())

    new_order = {
        'order_id': order_id,
        'account': account,
        'email': email,
        'phone': phone,
        'name': name,
        'postal_code': postal_code,
        'address1': address1,
        'address2': address2,
        'items': items,
        'amount': amount,
        'status': 'PENDING'
    }

    orders.append(new_order)
    save_orders(orders)
    print(email)
    
    # Create Payment Links via direct HTTP request
    headers_pro = {
        "Authorization": f"Bearer {SQUARE_ACCESS_TOKEN}",
        "Content-Type": "application/json",
        "Square-Version": "2025-06-19"
    }
    payload_pro = {
        "idempotency_key": order_id,
        "quick_pay": {
            "name": "Order Payment",
            "price_money": {
                "amount": amount,
                "currency": "JPY"
            },
            "location_id": SQUARE_LOCATION_ID
        },
        "checkout_options": {
            "redirect_url": f"http://localhost:3000/confirmation_payment?orderId={order_id}&status=COMPLETED"
        },
        "pre_populated_data": {
            "buyer_email": email
        }
    }
    headers_san = {
        "Authorization": f"Bearer {SQUARE_ACCESS_TOKEN_sandbox}",
        "Content-Type": "application/json",
        "Square-Version": "2025-06-19"
    }
    payload_san = {
        "idempotency_key": order_id,
        "quick_pay": {
            "name": "Order Payment (Sandbox)",
            "price_money": {
                "amount": amount,
                "currency": "JPY"
            },
            "location_id": SQUARE_LOCATION_ID_sandbox
        },
        "checkout_options": {
            "redirect_url": f"http://localhost/confirmation_payment?orderId={order_id}&status=COMPLETED"
        },
        "pre_populated_data": {
            "buyer_email": email
        }
    }
    
    # Determine Square Payment Links endpoint
    if SQUARE_ENVIRONMENT == 'production':
        api_url = "https://connect.squareup.com/v2/online-checkout/payment-links"
        resp = httpx.post(
            api_url,
            headers=headers_pro,
            json=payload_pro
        )
    else:
        api_url = "https://connect.squareupsandbox.com/v2/online-checkout/payment-links"
        resp = httpx.post(
            api_url,
            headers=headers_san,
            json=payload_san   
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
    
    orders = load_orders()
    data = request.get_json() or {}
    order_id = data.get('order_id')
    status = data.get('status')
    email = data.get('email')
    update = False
    print(f'order_id: {order_id}, status: {status}')

    for order in orders:
        if order['order_id'] == order_id:
            order['status'] = status
            order['update_at'] = datetime.utcnow().isoformat()
            update = True
            break
    
    save_orders(orders)
    print(f"email: {email}")
    print(f"update: {update}")
        # 注文確認メールを送信
    if update:
        try:
            send_order_email(
                next(o for o in orders if o.get('order_id') == order_id)['email'],
                next(o for o in orders if o.get('order_id') == order_id)
            )
            print(f"Completed send email to customer email:{email}")
            send_business_notification(
                next(o for o in orders if o.get('order_id') == order_id)
            )
        except Exception as e:
            print('送信エラー:', e)
            import traceback; traceback.print_exc()

    if update:
        return jsonify ({
            'status': 'Success',
            'order_id': order_id,
            'new_status': status
        })
    else:
        return jsonify ({
            'status': 'Failed',
            'message': 'Order not found'
        }), 404


@app.route('/api/reset_request', methods=["POST"])
def reset_request():
    print('received request of reset password')
    users = load_data()
    data = request.get_json() or {}
    email = data.get('email')
    token = str(uuid.uuid4())

    if email in users:
        send_reset_password(email, token)
        return jsonify ({
            "status": "Success",
            "message": "Reset email sent"
        }), 200
    else:
        return jsonify ({
            "status": "Failed",
            "message": "Email not found"
        }), 400
    
    
@app.route('/api/admin_login', methods=['POST'])
def admin_login():
    admins = load_admin_data()
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')
    admins_data = admins.get(email)
    if not email or not password:
        return jsonify ({
            "status": "Failed",
            "message": "Email and password are required"
        })

    if admins_data and admins_data['password'] == password:
        return jsonify ({
            'status': "Success",
            "message": "Loginned successfly"
        }), 200
    else:
        return jsonify ({
            "status": "Failed",
            "message": "Email or Password is incorrect"
        }), 401
    

@app.route('/api/get_order', methods=['GET'])
def get_order():
    orders = load_orders()
    return jsonify ({ 
        "orders": orders
    })



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)