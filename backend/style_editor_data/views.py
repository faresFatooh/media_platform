from rest_framework import viewsets
from .models import StyleExample
from .serializers import StyleExampleSerializer

class StyleExampleViewSet(viewsets.ModelViewSet):
    queryset = StyleExample.objects.all()
    serializer_class = StyleExampleSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
