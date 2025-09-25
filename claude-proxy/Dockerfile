# ✅ استخدم Node.js 18
FROM node:18

# ✅ تعيين مجلد العمل
WORKDIR /app

# ✅ نسخ ملفات الباكج فقط (للاستفادة من الكاش)
COPY package*.json ./

# ✅ تثبيت المكتبات
RUN npm install --production

# ✅ نسخ بقية الملفات
COPY . .

# ✅ تعيين متغير البيئة للبورت
ENV PORT=5001

# ✅ فتح البورت
EXPOSE 5001

# ✅ أمر التشغيل
CMD ["npm", "start"]
