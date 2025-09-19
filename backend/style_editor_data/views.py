from rest_framework import viewsets
from .models import StyleExample
from .serializers import StyleExampleSerializer
from rest_framework.permissions import IsAuthenticated


class StyleExampleViewSet(viewsets.ModelViewSet):
    queryset = StyleExample.objects.all()
    serializer_class = StyleExampleSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
