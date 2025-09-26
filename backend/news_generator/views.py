import feedparser
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import EditorialStyle, CustomNewsSource, MonitoredSource
from .serializers import (
    EditorialStyleSerializer,
    CustomNewsSourceSerializer,
    MonitoredSourceSerializer,
)


class IsOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user


# --- ViewSets ---

class EditorialStyleViewSet(viewsets.ModelViewSet):
    serializer_class = EditorialStyleSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return EditorialStyle.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CustomNewsSourceViewSet(viewsets.ModelViewSet):
    serializer_class = CustomNewsSourceSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return CustomNewsSource.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class MonitoredSourceViewSet(viewsets.ModelViewSet):
    serializer_class = MonitoredSourceSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return MonitoredSource.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    # ✅ API إضافي لعرض مقالات RSS من مصدر محدد
    @action(detail=True, methods=["get"])
    def articles(self, request, pk=None):
        try:
            source = self.get_queryset().get(pk=pk)
        except MonitoredSource.DoesNotExist:
            return Response({"error": "المصدر غير موجود"}, status=status.HTTP_404_NOT_FOUND)

        # قراءة RSS باستخدام feedparser
        feed = feedparser.parse(source.url)
        articles = []
        for entry in feed.entries[:10]:  # نجيب آخر 10 مقالات فقط
            articles.append({
                "id": entry.get("id", entry.get("link", "")),
                "title": entry.get("title", "بدون عنوان"),
                "link": entry.get("link", ""),
                "snippet": entry.get("summary", "")[:300],  # ملخص صغير
                "publishedDate": entry.get("published", ""),
            })

        return Response(articles, status=status.HTTP_200_OK)


# --- باقي الـ Views ---

class GenerateArticleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        title = request.data.get("title")
        if not title:
            return Response({"error": "العنوان مطلوب"}, status=status.HTTP_400_BAD_REQUEST)
        article = {"title": title, "content": f"هذا مقال تم توليده تلقائياً حول: {title}"}
        return Response(article, status=status.HTTP_200_OK)


class GenerateImageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        prompt = request.data.get("prompt")
        if not prompt:
            return Response({"error": "الوصف مطلوب"}, status=status.HTTP_400_BAD_REQUEST)
        image_url = f"https://via.placeholder.com/600x400.png?text={prompt.replace(' ', '+')}"
        return Response({"url": image_url}, status=status.HTTP_200_OK)
