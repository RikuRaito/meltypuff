# Python 公式イメージを使用
FROM python:3.11-slim AS builder

# 作業ディレクトリを設定
WORKDIR /app

# requirements.txt をコピー
COPY requirements.txt .

# 依存関係をインストール
RUN pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir gunicorn

# ソースコードをコピー
COPY . .

FROM python:3.11-slim AS runtime
WORKDIR /app

COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin
COPY --from=builder /app /app
COPY .env ./

ENV PYTHONUNBBUFFERED=1

# ポートを公開
EXPOSE 5001

# Flask アプリを起動
CMD ["gunicorn", "--capture-output", "--log-level","debug", "-w", "4", "-b", "0.0.0.0:5001", "app:app"]