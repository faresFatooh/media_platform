# ---- Build Stage ----
FROM node:18 AS builder

WORKDIR /app

# ننسخ package.json
COPY package*.json ./

# نثبت dependencies (مع devDependencies للبناء)
RUN npm install

# ننسخ باقي الملفات
COPY . .

# 🔑 نحفظ متغيرات البيئة اللي جايه من Render داخل .env.production
# هادا بيساعد Vite يلقطها وقت build
RUN printenv | grep ^VITE_ > .env.production || true

# ✅ نطبع عشان نتأكد
RUN echo "📄 محتويات .env.production:" && cat .env.production

# نعمل build
RUN npm run build


# ---- Production Stage ----
FROM node:18 AS runner

WORKDIR /app

# ننسخ package.json
COPY package*.json ./

# نثبت فقط production dependencies
RUN npm install --only=production

# ننسخ build output + server.js
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./server.js

# نفتح المنفذ
EXPOSE 3000

# نشغل السيرفر
CMD ["node", "server.js"]
