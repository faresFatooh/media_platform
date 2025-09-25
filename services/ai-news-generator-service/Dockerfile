# ---- Build stage ----
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# 👇 استلام الـ build args من Render
ARG VITE_MAIN_BACKEND_URL
ARG VITE_GEMINI_API_KEY
ARG VITE_CLAUDE_PROXY_URL

# 👇 تحويل الـ args لبيئة مرئية عند Vite
ENV VITE_MAIN_BACKEND_URL=$VITE_MAIN_BACKEND_URL
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY
ENV VITE_CLAUDE_PROXY_URL=$VITE_CLAUDE_PROXY_URL

# 👇 بناء المشروع (Vite يشوف env هنا)
RUN npm run build


# ---- Production stage ----
FROM node:18-alpine AS runner

WORKDIR /app

# نثبت فقط الـ dependencies اللازمة للتشغيل
COPY package*.json ./
RUN npm install --only=production

# ننسخ الملفات المبنية من الستيج الأول
COPY --from=builder /app/dist ./dist

EXPOSE 10000

# تشغيل Vite preview
CMD ["npm", "run", "preview", "--", "--port", "10000", "--host"]
