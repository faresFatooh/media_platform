from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .serializers import RegisterSerializer, UserSerializer
from django.contrib.auth.models import User

# ✅ API لتسجيل مستخدم جديد
class RegisterAPI(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            # تحديد الدور الأساسي للمستخدم عند التسجيل (يمكن تغييره لاحقًا من الـ admin)
            if user.is_superuser or user.is_staff:
                role = "admin"
            else:
                role = "user"

            return Response({
                "message": "User created successfully!",
                "role": role
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ✅ API لجلب بيانات المستخدم الحالي مع الدور
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
