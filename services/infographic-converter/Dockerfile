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
ARG VITE_INSTAGRAM_USER_ID
ARG VITE_CLOUDINARY_CLOUD_NAME
ARG VITE_CLOUDINARY_UPLOAD_PRESET

# نحولهم إلى ENV عشان Vite يقدر يقرأهم
ENV VITE_MAIN_BACKEND_URL=${VITE_MAIN_BACKEND_URL}
ENV VITE_GEMINI_API_KEY=${VITE_GEMINI_API_KEY}
ENV VITE_CLOUDINARY_PROXY_URL=${VITE_CLAUDE_PROXY_URL}
ENV VITE_PEXELS_API_KEY=${VITE_PEXELS_API_KEY}
ENV VITE_UNSPLASH_ACCESS_KEY=${VITE_UNSPLASH_ACCESS_KEY}
ENV VITE_FACEBOOK_PAGE_ID=${VITE_FACEBOOK_PAGE_ID}
ENV VITE_FACEBOOK_PAGE_ACCESS_TOKEN=${VITE_FACEBOOK_PAGE_ACCESS_TOKEN}
ENV VITE_INSTAGRAM_USER_ID=${VITE_INSTAGRAM_USER_ID}
ENV VITE_CLOUDINARY_CLOUD_NAME=${VITE_CLOUDINARY_CLOUD_NAME}
ENV VITE_CLOUDINARY_UPLOAD_PRESET=${VITE_CLOUDINARY_UPLOAD_PRESET}


# 🔽 --- أضف هذا الجزء للتحقق من المتغيرات --- 🔽
RUN echo "========================================="
RUN echo "CHECKING ENVIRONMENT VARIABLES..."
RUN echo "Cloudinary Cloud Name: $VITE_CLOUDINARY_CLOUD_NAME"
RUN echo "Cloudinary Upload Preset: $VITE_CLOUDINARY_UPLOAD_PRESET"
RUN echo "Facebook Page ID: $VITE_FACEBOOK_PAGE_ID"
RUN echo "Instagram User ID: $VITE_INSTAGRAM_USER_ID"
RUN echo "========================================="
# 🔼 --- نهاية جزء التحقق --- 🔼

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