FROM node:24-alpine

WORKDIR /app
COPY package.json server.mjs index.html app.js styles.css ./
COPY public ./public

RUN mkdir -p /app/data

ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_PATH=/app/data/huanji.db

EXPOSE 3000

CMD ["node", "server.mjs"]
