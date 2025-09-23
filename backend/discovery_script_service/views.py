from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from .models import ApiConfig
from .serializers import ApiConfigSerializer

class ApiConfigView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        config, _ = ApiConfig.objects.get_or_create(user=request.user)
        serializer = ApiConfigSerializer(config)
        return Response(serializer.data)

    def post(self, request):
        config, _ = ApiConfig.objects.get_or_create(user=request.user)
        serializer = ApiConfigSerializer(config, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        return Response(serializer.data)
    