from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role')

    def get_role(self, obj):
        role = "admin" if obj.is_superuser and obj.is_staff else "user"
        print(f"[Serializer] {obj.username} -> is_superuser={obj.is_superuser}, is_staff={obj.is_staff}, role={role}")
        return role

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['username'] = self.user.username
        data['email'] = self.user.email
        data['is_superuser'] = self.user.is_superuser
        data['is_staff'] = self.user.is_staff

        # تحديد الدور بناءً على staff و superuser
        role = 'admin' if self.user.is_superuser and self.user.is_staff else 'user'
        data['role'] = role
        print(f"[Token Serializer] role for {self.user.username}: {role}")
        return data
