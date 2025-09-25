import logging
from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .mixins import NoCacheMixin  # ✅ استورد الميكسين

from .models import EditorialStyle, CustomNewsSource, MonitoredSource
from .serializers import (
    EditorialStyleSerializer,
    CustomNewsSourceSerializer,
    MonitoredSourceSerializer,
)
logger = logging.getLogger(__name__)

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
class MonitoredSourceViewSet(NoCacheMixin, viewsets.ModelViewSet):
    serializer_class = MonitoredSourceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return MonitoredSource.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        logger.info(f"✅ MonitoredSource created: {obj.url} for user {self.request.user}")



# --- Generate Article ---
class GenerateArticleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        title = request.data.get("title")
        if not title:
            return Response({"error": "العنوان مطلوب"}, status=status.HTTP_400_BAD_REQUEST)

        article = {
            "title": title,
            "content": f"هذا مقال تم توليده تلقائياً حول: {title}",
        }
        return Response(article, status=status.HTTP_200_OK)


# --- Generate Image ---
class GenerateImageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        prompt = request.data.get("prompt")
        if not prompt:
            return Response({"error": "الوصف مطلوب"}, status=status.HTTP_400_BAD_REQUEST)

        image_url = f"https://via.placeholder.com/600x400.png?text={prompt.replace(' ', '+')}"
        return Response({"url": image_url}, status=status.HTTP_200_OK)

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        prompt = request.data.get("prompt")
        if not prompt:
            return Response({"error": "الوصف مطلوب"}, status=status.HTTP_400_BAD_REQUEST)

        # ✨ هنا منطق توليد الصورة (مؤقتاً نرجع URL وهمي)
        image_url = f"https://via.placeholder.com/600x400.png?text={prompt.replace(' ', '+')}"
        return Response({"url": image_url}, status=status.HTTP_200_OK)

