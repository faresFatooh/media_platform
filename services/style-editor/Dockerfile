FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY server/package*.json ./server/

COPY . .

EXPOSE 3000

CMD ["sh", "-c", "npm install && npm install --prefix server && npm run dev"]