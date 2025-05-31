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