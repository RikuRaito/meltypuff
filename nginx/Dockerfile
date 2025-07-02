# nginx 公式イメージを使用
FROM nginx:alpine

# 設定ファイルをコピー
COPY nginx.conf /etc/nginx/nginx.conf

# ポートを公開
EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1