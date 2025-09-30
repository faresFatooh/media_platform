# ---- Build Stage ----
FROM node:20 AS builder

# نحدد مجلد العمل
WORKDIR /app

# نستقبل env vars أثناء الـ build
ARG VITE_MAIN_BACKEND_URL
ARG VITE_GEMINI_API_KEY
ARG VITE_CLAUDE_PROXY_URL
ARG VITE_PEXELS_API_KEY
ARG VITE_UNSPLASH_ACCESS_KEY
ARG VITE_FACEBOOK_PAGE_ID
ARG VITE_FACEBOOK_PAGE_ACCESS_TOKEN
ARG VITE_INSTAGRAM_USER_ID   # *** تمت إضافة هذا السطر ***

# نحولهم إلى ENV عشان Vite يقدر يقرأهم
ENV VITE_MAIN_BACKEND_URL=${VITE_MAIN_BACKEND_URL}
ENV VITE_GEMINI_API_KEY=${VITE_GEMINI_API_KEY}
ENV VITE_CLAUDE_PROXY_URL=${VITE_CLAUDE_PROXY_URL}
ENV VITE_PEXELS_API_KEY=${VITE_PEXELS_API_KEY}
ENV VITE_UNSPLASH_ACCESS_KEY=${VITE_UNSPLASH_ACCESS_KEY}
ENV VITE_FACEBOOK_PAGE_ID=${VITE_FACEBOOK_PAGE_ID}
ENV VITE_FACEBOOK_PAGE_ACCESS_TOKEN=${VITE_FACEBOOK_PAGE_ACCESS_TOKEN}
ENV VITE_INSTAGRAM_USER_ID=${VITE_INSTAGRAM_USER_ID}

# ننسخ ملفات الباكيج أولاً لتقليل إعادة تثبيت الحزم عند تغيّر الكود
COPY package*.json ./
RUN npm install

# نسخ بقية المشروع
COPY . .

# بناء المشروع
RUN npm run build

# ---- Production Stage ----
FROM node:20 AS runner

WORKDIR /app

# تثبيت serve لتقديم الـ build
RUN npm install -g serve

# نسخ مجلد dist من مرحلة البناء
COPY --from=builder /app/dist ./dist

# فتح البورت
EXPOSE 10000

# أمر تشغيل السيرفر
CMD ["serve", "-s", "dist", "-l", "10000"]