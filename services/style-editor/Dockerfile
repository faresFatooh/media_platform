# المرحلة الأولى: بناء المشروع
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# يقوم ببناء الملفات النهائية للإنتاج
RUN npm run build

# المرحلة الثانية: تقديم الملفات النهائية
FROM node:18-alpine
WORKDIR /app
# انسخ فقط الملفات المبنية من المرحلة السابقة
COPY --from=builder /app/dist ./dist  # لـ Vite
COPY --from=builder /app/out ./out    # لـ Next.js (إذا كان موجودًا)
COPY package.json .

# قم بتشغيل خادم بسيط لتقديم الملفات
CMD ["npx", "serve", "-s", "dist"] # أو "out" لـ Next.js