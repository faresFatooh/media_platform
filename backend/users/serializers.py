from django.contrib.auth.models import User
from rest_framework import serializers, validators
# ---==[ إضافة ]==---
# استيراد السيريلايزر الأساسي لـ SimpleJWT
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
# ---==[ نهاية الإضافة ]==---


class UserSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(
        choices=[('user', 'User'), ('admin', 'Admin')],
        default='user',
        write_only=True
    )

    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'first_name', 'last_name', 'role')
        extra_kwargs = {
            "password": {"write_only": True},
            "email": {
                "required": True,
                "allow_blank": False,
                "validators": [
                    validators.UniqueValidator(User.objects.all(), "A user with that Email already exists.")
                ],
            },
        }

    def create(self, validated_data):
        role = validated_data.pop('role', 'user')
        is_staff = True if role == 'admin' else False
        is_superuser = True if role == 'admin' else False  # اختياري لو تريد صلاحيات كاملة
        user = User.objects.create_user(**validated_data, is_staff=is_staff, is_superuser=is_superuser)
        return user


# ---==[ إضافة ]==---
# سيريلايزر مخصص لإضافة الدور (role) لبيانات استجابة تسجيل الدخول
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # الحصول على البيانات الافتراضية (access & refresh tokens)
        data = super().validate(attrs)

        # إضافة بيانات المستخدم "role" إلى الاستجابة
        # self.user هو المستخدم الذي نجح في تسجيل الدخول
        role = "admin" if self.user.is_staff or self.user.is_superuser else "user"
        data['role'] = role
        
        # (اختياري) يمكنك إضافة أي بيانات أخرى هنا
        data['username'] = self.user.username
        data['email'] = self.user.email

        return data
# ---==[ نهاية الإضافة ]==---