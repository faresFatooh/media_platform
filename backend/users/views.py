from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
# ---==[ إضافة ]==---
# استيراد الـ View الأساسية من SimpleJWT
from rest_framework_simplejwt.views import TokenObtainPairView
# استيراد السيريلايزر العادي والسيريلايزر المخصص
from .serializers import UserSerializer, MyTokenObtainPairSerializer 
# ---==[ نهاية الإضافة ]==---


# تسجيل مستخدم جديد
class RegisterAPI(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            role = "admin" if user.is_staff or user.is_superuser else "user"

            refresh = RefreshToken.for_user(user)

            return Response({
                "message": "User created successfully!",
                "role": role,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# جلب بيانات المستخدم الحالي مع الدور
class CurrentUserAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        role = "admin" if user.is_staff or user.is_superuser else "user"
        return Response({
            **serializer.data,
            "role": role
        }, status=status.HTTP_200_OK)


# ---==[ إضافة ]==---
# View مخصصة لتسجيل الدخول تستخدم السيريلايزر المخصص
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
# ---==[ نهاية الإضافة ]==---