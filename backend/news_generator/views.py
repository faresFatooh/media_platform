from rest_framework import generics, permissions
from rest_framework.response import Response
from .models import EditorialStyle, CustomNewsSource, MonitoredSource
from .serializers import (
    EditorialStyleSerializer,
    CustomNewsSourceSerializer,
    MonitoredSourceSerializer,
)

# --- Styles ---
class EditorialStyleViewSet(generics.ListCreateAPIView, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = EditorialStyleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return EditorialStyle.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# --- Custom sources ---
class CustomNewsSourceViewSet(generics.ListCreateAPIView, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CustomNewsSourceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CustomNewsSource.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# --- Monitored sources ---
class MonitoredSourceListCreateView(generics.ListCreateAPIView):
    serializer_class = MonitoredSourceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return MonitoredSource.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    # ✅ override create عشان يرجع الـ object الجديد بعد الـ POST
    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        return Response(response.data, status=201)
