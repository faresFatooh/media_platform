from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import ApiConfig
from .serializers import ApiConfigSerializer

class ApiConfigViewSet(viewsets.ViewSet):
    """
    A simple ViewSet for viewing and editing API configurations.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ApiConfigSerializer

    def list(self, request):
        # get_or_create ensures a config object always exists for the user
        config, _ = ApiConfig.objects.get_or_create(user=request.user)
        serializer = self.serializer_class(config)
        return Response(serializer.data)

    def create(self, request):
        config, _ = ApiConfig.objects.get_or_create(user=request.user)
        serializer = self.serializer_class(config, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save() # No need to pass user here, it's already linked
        return Response(serializer.data)