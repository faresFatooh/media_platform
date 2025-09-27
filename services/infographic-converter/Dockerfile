# ---- Build Stage ----
FROM node:18 AS builder

WORKDIR /app

# نستقبل env vars من Render أثناء الـ build
ARG VITE_MAIN_BACKEND_URL
ARG VITE_GEMINI_API_KEY
ARG VITE_CLAUDE_PROXY_URL

# نحولهم إلى ENV عشان vite يشوفهم
ENV VITE_MAIN_BACKEND_URL=${VITE_MAIN_BACKEND_URL}
ENV VITE_GEMINI_API_KEY=${VITE_GEMINI_API_KEY}
ENV VITE_CLAUDE_PROXY_URL=${VITE_CLAUDE_PROXY_URL}

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build


# ---- Production Stage ----
FROM node:18 AS runner

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist ./dist

EXPOSE 10000

CMD ["serve", "-s", "dist", "-l", "10000"]
