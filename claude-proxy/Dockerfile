# استخدم Node.js
FROM node:18

# تعيين مجلد العمل
WORKDIR /app

# نسخ ملفات الباكج
COPY package*.json ./

# تثبيت المكتبات
RUN npm install

# نسخ بقية الملفات
COPY . .

# تعيين البورت
EXPOSE 5001

# أمر التشغيل
CMD ["npm", "start"]
