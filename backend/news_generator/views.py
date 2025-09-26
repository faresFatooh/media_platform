from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import EditorialStyle, CustomNewsSource, MonitoredSource
from .serializers import (
    EditorialStyleSerializer,
    CustomNewsSourceSerializer,
    MonitoredSourceSerializer,
)

# This custom permission is important for security
class IsOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user

# --- Corrected ViewSets Below ---

class EditorialStyleViewSet(viewsets.ModelViewSet):
    serializer_class = EditorialStyleSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return EditorialStyle.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    # The redundant 'create' method has been removed.

class CustomNewsSourceViewSet(viewsets.ModelViewSet):
    serializer_class = CustomNewsSourceSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return CustomNewsSource.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    # The redundant 'create' method has been removed.

class MonitoredSourceViewSet(viewsets.ModelViewSet):
    serializer_class = MonitoredSourceSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return MonitoredSource.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    # The redundant 'create' method has been removed.


# --- These views below were already correct and remain unchanged ---

# --- Generate Article ---
class GenerateArticleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        title = request.data.get("title")
        if not title:
            return Response({"error": "العنوان مطلوب"}, status=status.HTTP_400_BAD_REQUEST)

        # ⚡ Placeholder generation logic
        article = {
            "title": title,
            "content": f"هذا مقال تم توليده تلقائياً حول: {title}"
        }
        return Response(article, status=status.HTTP_200_OK)


# --- Generate Image ---
class GenerateImageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        prompt = request.data.get("prompt")
        if not prompt:
            return Response({"error": "الوصف مطلوب"}, status=status.HTTP_400_BAD_REQUEST)

        # ⚡ Placeholder image URL generation
        image_url = f"https://via.placeholder.com/600x400.png?text={prompt.replace(' ', '+')}"
        return Response({"url": image_url}, status=status.HTTP_200_OK)