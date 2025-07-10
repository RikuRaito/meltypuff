# ——— 前段：フロントビルド ———
FROM node:18-alpine AS frontend_builder
WORKDIR /app

# リポジトリルートの frontend ディレクトリを参照
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ——— 後段：nginx 実行用 ———
FROM nginx:alpine
# ビルド成果物を nginx 配下にコピー
COPY --from=frontend_builder /app/dist /usr/share/nginx/html
# カスタム設定
COPY nginx/nginx.conf /etc/nginx/nginx.conf

RUN chmod -R o+r /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]