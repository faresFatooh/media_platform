# ---- Build Stage ----
FROM node:18 AS builder

WORKDIR /app

# ننسخ package.json و package-lock.json
COPY package*.json ./

# تثبيت كل الـ dependencies (بما فيها devDependencies)
RUN npm install

# ننسخ باقي الملفات
COPY . .

# نعمل build
RUN npm run build


# ---- Production Stage ----
FROM node:18 AS runner

WORKDIR /app

# نثبت serve فقط (لتقديم الملفات)
RUN npm install -g serve

# ننسخ ملفات build فقط
COPY --from=builder /app/dist ./dist

# نحدد المنفذ (Render يستخدم 10000 بشكل افتراضي)
EXPOSE 10000

# نشغل السيرفر
CMD ["serve", "-s", "dist", "-l", "10000"]
