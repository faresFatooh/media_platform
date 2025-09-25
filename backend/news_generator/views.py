from rest_framework import viewsets, permissions
from rest_framework.response import Response
from .models import EditorialStyle, CustomNewsSource, MonitoredSource
from .serializers import (
    EditorialStyleSerializer,
    CustomNewsSourceSerializer,
    MonitoredSourceSerializer,
)

# --- Styles ---
class EditorialStyleViewSet(viewsets.ModelViewSet):
    serializer_class = EditorialStyleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return EditorialStyle.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# --- Custom sources ---
class CustomNewsSourceViewSet(viewsets.ModelViewSet):
    serializer_class = CustomNewsSourceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CustomNewsSource.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# --- Monitored sources ---
class MonitoredSourceViewSet(viewsets.ModelViewSet):
    serializer_class = MonitoredSourceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return MonitoredSource.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
