# style_editor_data/views.py
from rest_framework import viewsets, permissions
from .models import StyleExample
from .serializers import StyleExampleSerializer

class StyleExampleViewSet(viewsets.ModelViewSet):
    queryset = StyleExample.objects.all()
    serializer_class = StyleExampleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)  # ربط المثال بالمستخدم
