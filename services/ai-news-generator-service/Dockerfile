# ---- Build Stage ----
FROM node:18 AS builder

WORKDIR /app

# ننسخ package.json و package-lock.json
COPY package*.json ./

# نثبت dependencies كاملة (تشمل devDependencies للبناء)
RUN npm install

# ننسخ باقي الملفات
COPY . .

# ⚡ نولّد ملف .env.production من env vars اللي تبدأ بـ VITE_
RUN printenv | grep ^VITE_ > .env.production || true

# 🪵 Debug: اطبع محتويات .env.production عشان نتأكد
RUN echo "📄 محتويات .env.production:" && cat .env.production

# نعمل build
RUN npm run build


# ---- Production Stage ----
FROM node:18 AS runner

WORKDIR /app

# ننسخ فقط package.json و package-lock.json
COPY package*.json ./

# نثبت dependencies الخاصة بالـ production
RUN npm install --only=production

# ننسخ ملفات build والـ server.js
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./server.js

# نحدد المنفذ
EXPOSE 3000

# نشغل الـ server.js
CMD ["node", "server.js"]
