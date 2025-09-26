print(">>> VIEWS.PY: Level 0 - File is being loaded and parsed by Python.")

from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
import feedparser

from .models import EditorialStyle, CustomNewsSource, MonitoredSource
from .serializers import (
    EditorialStyleSerializer,
    CustomNewsSourceSerializer,
    MonitoredSourceSerializer,
)

print(">>> VIEWS.PY: Level 1 - All imports are complete.")


class IsOwner(permissions.BasePermission):
    print(">>> VIEWS.PY: Level 2 - IsOwner permission class is being defined.")

    def has_object_permission(self, request, view, obj):
        print(f">>> IsOwner: Checking permission for object {obj.id} for user {request.user.id}")
        return obj.user == request.user


# --- Corrected ViewSets Below ---

class EditorialStyleViewSet(viewsets.ModelViewSet):
    print(">>> VIEWS.PY: Level 3 - EditorialStyleViewSet class is being defined.")
    serializer_class = EditorialStyleSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        print(f">>> EditorialStyleViewSet: get_queryset called for user {self.request.user.id}")
        return EditorialStyle.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        print(f">>> EditorialStyleViewSet: perform_create called for user {self.request.user.id}")
        serializer.save(user=self.request.user)


class CustomNewsSourceViewSet(viewsets.ModelViewSet):
    print(">>> VIEWS.PY: Level 4 - CustomNewsSourceViewSet class is being defined.")
    serializer_class = CustomNewsSourceSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        print(f">>> CustomNewsSourceViewSet: get_queryset called for user {self.request.user.id}")
        return CustomNewsSource.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        print(f">>> CustomNewsSourceViewSet: perform_create called for user {self.request.user.id}")
        serializer.save(user=self.request.user)


class MonitoredSourceViewSet(viewsets.ModelViewSet):
    print(">>> VIEWS.PY: Level 5 - MonitoredSourceViewSet class is being defined.")
    serializer_class = MonitoredSourceSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        print(f">>> MonitoredSourceViewSet: get_queryset called for user {self.request.user.id}")
        return MonitoredSource.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        print(">>> MonitoredSourceViewSet: STEP 5 - Calling perform_create to save to the database...")
        serializer.save(user=self.request.user)
        print(">>> MonitoredSourceViewSet: STEP 6 - perform_create has FINISHED.")

    def create(self, request, *args, **kwargs):
        print(">>> MonitoredSourceViewSet: STEP 1 - Entered the CREATE method.")
        print(">>> MonitoredSourceViewSet: STEP 2 - Raw request data is:", request.data)
        serializer = self.get_serializer(data=request.data)
        print(">>> MonitoredSourceViewSet: STEP 3 - Serializer has been initialized.")
        if serializer.is_valid():
            print(">>> MonitoredSourceViewSet: STEP 4 - Serializer validation SUCCEEDED.")
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            print(">>> MonitoredSourceViewSet: STEP 7 - Success headers have been generated.")
            print(">>> MonitoredSourceViewSet: STEP 8 - Returning successful Response with data:", serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        else:
            print(">>> MonitoredSourceViewSet: !!! STEP 4 FAILED: Serializer validation FAILED.")
            print(">>> MonitoredSourceViewSet: !!! Validation Errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # ✅ إضافة endpoint جديد للمقالات
    @action(detail=True, methods=["get"], url_path="articles")
    def fetch_articles(self, request, pk=None):
        print(f">>> MonitoredSourceViewSet: Fetching articles for source id={pk}")
        source = self.get_object()
        feed = feedparser.parse(source.url)

        articles = []
        for entry in feed.entries[:10]:  # أول 10 مقالات فقط
            articles.append({
                "id": entry.get("id", entry.get("link", "")),
                "title": entry.get("title", "بدون عنوان"),
                "link": entry.get("link", ""),
                "snippet": entry.get("summary", "")[:200],
                "publishedDate": entry.get("published", ""),
            })

        print(f">>> MonitoredSourceViewSet: Returning {len(articles)} articles for source id={pk}")
        return Response(articles)


# --- These views below were already correct and remain unchanged ---

class GenerateArticleView(APIView):
    print(">>> VIEWS.PY: Level 6 - GenerateArticleView class is being defined.")
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        print(">>> GenerateArticleView: POST method entered.")
        title = request.data.get("title")
        if not title:
            print(">>> GenerateArticleView: ERROR - Title is missing.")
            return Response({"error": "العنوان مطلوب"}, status=status.HTTP_400_BAD_REQUEST)
        print(f">>> GenerateArticleView: Generating article for title: {title}")
        article = {"title": title, "content": f"هذا مقال تم توليده تلقائياً حول: {title}"}
        return Response(article, status=status.HTTP_200_OK)


class GenerateImageView(APIView):
    print(">>> VIEWS.PY: Level 7 - GenerateImageView class is being defined.")
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        print(">>> GenerateImageView: POST method entered.")
        prompt = request.data.get("prompt")
        if not prompt:
            print(">>> GenerateImageView: ERROR - Prompt is missing.")
            return Response({"error": "الوصف مطلوب"}, status=status.HTTP_400_BAD_REQUEST)
        print(f">>> GenerateImageView: Generating image for prompt: {prompt}")
        image_url = f"https://via.placeholder.com/600x400.png?text={prompt.replace(' ', '+')}"
        return Response({"url": image_url}, status=status.HTTP_200_OK)


print(">>> VIEWS.PY: Level 8 - End of file reached.")
