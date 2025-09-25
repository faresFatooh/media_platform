FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .

# ✅ Build React app
RUN npm run build

EXPOSE 3000

# ✅ Start Express server
CMD ["npm", "run", "server"]
