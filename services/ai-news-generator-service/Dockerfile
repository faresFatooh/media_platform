# ---- مرحلة البناء ----
FROM node:18-alpine AS builder

WORKDIR /app

# نسخ ملفات التعريف
COPY package*.json ./
RUN npm install

# نسخ باقي الملفات
COPY . .

# تمرير متغيرات البيئة من Render للبيلد
ARG VITE_GEMINI_API_KEY
ARG VITE_CLAUDE_PROXY_URL
ARG VITE_MAIN_BACKEND_URL

# نثبتهم وقت البيلد
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY
ENV VITE_CLAUDE_PROXY_URL=$VITE_CLAUDE_PROXY_URL
ENV VITE_MAIN_BACKEND_URL=$VITE_MAIN_BACKEND_URL

# بناء نسخة production
RUN npm run build

# ---- مرحلة التشغيل ----
FROM node:18-alpine

WORKDIR /app

# ننسخ build النهائي فقط
COPY --from=builder /app/dist ./dist
COPY package*.json ./

RUN npm install --only=production

EXPOSE 3000

# تشغيل السيرفر بواجهة Vite preview
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]
