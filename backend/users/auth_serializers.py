from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .serializers import UserSerializer # استيراد السيريلايزر الحالي

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # الحصول على البيانات الافتراضية (access & refresh tokens)
        data = super().validate(attrs)

        # إضافة بيانات المستخدم "role" إلى الاستجابة
        # self.user هو المستخدم الذي نجح في تسجيل الدخول
        role = "admin" if self.user.is_staff or self.user.is_superuser else "user"
        data['role'] = role
        
        # يمكنك إضافة أي بيانات أخرى هنا
        data['username'] = self.user.username
        data['email'] = self.user.email

        return data