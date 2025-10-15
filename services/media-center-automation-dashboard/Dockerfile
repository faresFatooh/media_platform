# ---- Build Stage ----
FROM node:20 AS builder

WORKDIR /app

ARG VITE_MAIN_BACKEND_URL
ARG N8N_API_KEY

ENV VITE_MAIN_BACKEND_URL=${VITE_MAIN_BACKEND_URL}
ENV N8N_API_KEY=${N8N_API_KEY}


COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ---- Production Stage ----
FROM node:20 AS runner

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist ./dist

# ✅ خطوة Debug: طباعة الملفات اللي جوّا dist
RUN echo "📂 محتويات dist:" && ls -R ./dist

EXPOSE 10000

CMD ["serve", "-s", "dist", "-l", "10000"]
