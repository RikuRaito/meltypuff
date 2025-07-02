# Python 公式イメージを使用
FROM python:3.11-slim

# 作業ディレクトリを設定
WORKDIR /app

# requirements.txt をコピー
COPY requirements.txt .

# 依存関係をインストール
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir gunicorn

# ソースコードをコピー
COPY . .

# ポートを公開
EXPOSE 5001

# Flask アプリを起動
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5001", "app:app"]