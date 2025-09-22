# backend/discovery_data/views.py

from rest_framework import viewsets, permissions
from .models import DiscoveryScript
from .serializers import DiscoveryScriptSerializer

class DiscoveryScriptViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Discovery Scripts to be viewed or edited.
    """
    queryset = DiscoveryScript.objects.all().order_by('-created_at')
    serializer_class = DiscoveryScriptSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # This ensures users can only see their own scripts
        return self.queryset.filter(owner=self.request.user)

    def perform_create(self, serializer):
        # This automatically assigns the logged-in user as the owner when a new script is created
        serializer.save(owner=self.request.user)