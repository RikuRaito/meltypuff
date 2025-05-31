from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from dotenv import load_dotenv

# 環境変数の読み込み
load_dotenv()

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False

# CORS設定（React側からのアクセスを許可）
CORS(app, origins=['http://localhost:3000'])

# テスト用のデータ
sample_data = [
    {"id": 1, "name": "サンプル1", "description": "テストデータ1"},
    {"id": 2, "name": "サンプル2", "description": "テストデータ2"},
    {"id": 3, "name": "サンプル3", "description": "テストデータ3"}
]

# ルートエンドポイント
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "OK", "message": "Flask API is running"})

# データ取得エンドポイント
@app.route('/api/data', methods=['GET'])
def get_data():
    return jsonify({"data": sample_data})

# データ作成エンドポイント
@app.route('/api/data', methods=['POST'])
def create_data():
    new_item = request.get_json()
    new_item['id'] = len(sample_data) + 1
    sample_data.append(new_item)
    return jsonify({"message": "データが作成されました", "data": new_item}), 201

# 特定データ取得エンドポイント
@app.route('/api/data/<int:item_id>', methods=['GET'])
def get_item(item_id):
    item = next((item for item in sample_data if item['id'] == item_id), None)
    if item:
        return jsonify({"data": item})
    return jsonify({"error": "データが見つかりません"}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)