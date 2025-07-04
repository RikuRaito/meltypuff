# Node.js 公式イメージを使用
FROM node:18-alpine

# 作業ディレクトリを設定
WORKDIR /app

# package.json と package-lock.json をコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm install

# ソースコードをコピー
COPY . .

# 環境変数を設定
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true

# ポートを公開
EXPOSE 3000

# 開発サーバーを起動（詳細ログ付き）
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--force"]
# 1️⃣ Builder stage: build React app
FROM node:18-alpine AS builder
WORKDIR /app
# package.json and lockfile
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 2️⃣ Runtime stage: serve with nginx
FROM nginx:alpine
# Copy build artifacts
COPY --from=builder /app/dist /usr/share/nginx/html
# Expose port 80
EXPOSE 80
# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]