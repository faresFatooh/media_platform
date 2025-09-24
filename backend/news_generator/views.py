from rest_framework import viewsets, permissions
from .models import EditorialStyle, CustomNewsSource, MonitoredSource
from .serializers import EditorialStyleSerializer, CustomNewsSourceSerializer, MonitoredSourceSerializer

class EditorialStyleViewSet(viewsets.ModelViewSet):
    serializer_class = EditorialStyleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Ensure users only see their own styles
        return EditorialStyle.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Automatically assign the logged-in user as the owner
        serializer.save(user=self.request.user)

class CustomNewsSourceViewSet(viewsets.ModelViewSet):
    serializer_class = CustomNewsSourceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CustomNewsSource.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class MonitoredSourceViewSet(viewsets.ModelViewSet):
    serializer_class = MonitoredSourceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return MonitoredSource.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)