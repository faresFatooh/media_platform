from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import UserSerializer, MyTokenObtainPairSerializer

class RegisterAPI(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            role = "admin" if user.is_superuser and user.is_staff else "user"
            refresh = RefreshToken.for_user(user)
            print(f"[RegisterAPI] Created {user.username} -> role={role}")

            return Response({
                "message": "User created successfully!",
                "role": role,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            }, status=status.HTTP_201_CREATED)
        print(f"[RegisterAPI] Validation errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CurrentUserAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        role = "admin" if user.is_superuser and user.is_staff else "user"
        print(f"[CurrentUserAPI] {user.username} -> role={role}")
        return Response({
            **serializer.data,
            "role": role
        }, status=status.HTTP_200_OK)

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
