from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import NewsArticle, GeneratedPost
from .serializers import NewsArticleSerializer, GeneratedPostSerializer
from django.conf import settings
import google.generativeai as genai
import json

# ... (تهيئة Gemini كما في المرة السابقة) ...
try:
    if settings.GEMINI_API_KEY:
        genai.configure(api_key=settings.GEMINI_API_KEY)
except Exception as e:
    print(f"Warning: Gemini API key not configured. Error: {e}")

class NewsArticleViewSet(viewsets.ModelViewSet):
    serializer_class = NewsArticleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return NewsArticle.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'], url_path='process-and-generate')
    def process_and_generate(self, request):
        """
        الوظيفة الرئيسية: تستقبل رابطًا أو نصًا، تحلله، تحفظه،
        ثم تولد منشورات التواصل الاجتماعي وتحفظها.
        """
        source_url = request.data.get('url')
        original_text = request.data.get('text')
        platforms = request.data.get('platforms', [])

        if not (source_url or original_text) or not platforms:
            return Response({"error": "URL/text and platforms are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            model = genai.GenerativeModel("gemini-1.5-flash")
            
            # 1. تحليل وتلخيص الخبر
            content_to_parse = f"URL: {source_url}" if source_url else f'Text: "{original_text}"'
            parsing_prompt = f"""
            Analyze the provided news content. Your output must be a clean JSON object with keys: "headline", "summary", and "entities".
            Content: {content_to_parse}
            """
            parsing_response = model.generate_content(parsing_prompt)
            parsed_data = json.loads(parsing_response.text)

            # 2. حفظ المقال الأصلي في قاعدة البيانات
            article = NewsArticle.objects.create(
                user=request.user,
                source_url=source_url,
                original_text=original_text or parsed_data.get('summary', ''),
                topic="Asharq News"
            )

            # 3. توليد منشورات التواصل الاجتماعي
            generation_prompt = f"""
            Based on the following news data, generate tailored captions in Arabic for these platforms: {', '.join(platforms)}.
            Your output must be a clean JSON object where keys are the platform names.
            News Data:
            - Headline: {parsed_data.get('headline')}
            - Summary: {parsed_data.get('summary')}
            """
            generation_response = model.generate_content(generation_prompt)
            generated_captions = json.loads(generation_response.text)

            # 4. حفظ المنشورات المولدة في قاعدة البيانات
            posts_to_save = []
            for platform, content in generated_captions.items():
                post = GeneratedPost(
                    article=article,
                    platform=platform,
                    content=content
                )
                posts_to_save.append(post)
            
            GeneratedPost.objects.bulk_create(posts_to_save)
            
            # 5. إرجاع كل البيانات إلى الواجهة الأمامية
            final_result = {
                'parsed_news': parsed_data,
                'generated_posts': generated_captions
            }
            return Response(final_result, status=status.HTTP_201_CREATED)

        except Exception as e:
            print(f"Error in process_and_generate: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)