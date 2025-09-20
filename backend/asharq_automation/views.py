from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import NewsArticle, GeneratedPost
from .serializers import NewsArticleSerializer
from django.conf import settings
import google.generativeai as genai
import json

# تهيئة Gemini
try:
    if settings.GEMINI_API_KEY:
        genai.configure(api_key=settings.GEMINI_API_KEY)
    else:
        print("Warning: GEMINI_API_KEY not found in settings.")
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
        source_url = request.data.get('url')
        original_text = request.data.get('text')
        platforms = request.data.get('platforms', [])
        brand_id = request.data.get('brandId', 'asharq')

        if not (source_url or original_text) or not platforms:
            return Response({"error": "URL/text and platforms are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            model = genai.GenerativeModel("gemini-1.5-flash")
            
            # --- التعديل الأول: إضافة معالجة الأخطاء هنا ---
            content_to_parse = f"URL: {source_url}" if source_url else f'Text: "{original_text}"'
            parsing_prompt = f"""
            Analyze the provided news content. Your output must be a clean JSON object with keys: "headline", "summary", and "entities".
            Content: {content_to_parse}
            """
            parsing_response = model.generate_content(parsing_prompt)
            
            parsed_data = {}
            try:
                # محاولة قراءة رد Gemini كـ JSON
                parsed_data = json.loads(parsing_response.text)
            except json.JSONDecodeError:
                # إذا فشلت القراءة، اطبع الخطأ في السجلات وقدم بيانات بديلة آمنة
                print(f"--- Gemini Non-JSON Parsing Response ---\n{parsing_response.text}\n--------------------")
                parsed_data = {
                    "headline": "Could not parse headline from source",
                    "summary": original_text or "Could not parse summary from source",
                    "entities": []
                }

            article = NewsArticle.objects.create(
                user=request.user,
                source_url=source_url,
                original_text=original_text or parsed_data.get('summary', ''),
                topic=brand_id
            )

            # --- التعديل الثاني: إضافة معالجة الأخطاء هنا أيضًا ---
            generation_prompt = f"""
            Based on the following news data, generate tailored captions in Arabic for these platforms: {', '.join(platforms)}.
            Your output must be a clean JSON object where keys are the platform names.
            News Data:
            - Headline: {parsed_data.get('headline')}
            - Summary: {parsed_data.get('summary')}
            """
            generation_response = model.generate_content(generation_prompt)
            
            generated_captions = {}
            try:
                # محاولة قراءة رد Gemini كـ JSON
                generated_captions = json.loads(generation_response.text)
            except json.JSONDecodeError:
                # إذا فشلت القراءة، اطبع الخطأ وقدم رسائل بديلة آمنة
                print(f"--- Gemini Non-JSON Generation Response ---\n{generation_response.text}\n--------------------")
                generated_captions = {platform: "Failed to generate caption due to safety or format error." for platform in platforms}

            posts_to_save = []
            for platform, content in generated_captions.items():
                # التأكد من أن اسم المنصة يطابق الاختيارات في المودل
                valid_platform_name = next((p[0] for p in GeneratedPost.PLATFORM_CHOICES if p[0].lower() == platform.lower()), None)
                if valid_platform_name:
                    post = GeneratedPost(
                        article=article,
                        platform=valid_platform_name,
                        content=content
                    )
                    posts_to_save.append(post)
            
            if posts_to_save:
                GeneratedPost.objects.bulk_create(posts_to_save)
            
            serializer = NewsArticleSerializer(article)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            # للتعامل مع أي أخطاء حرجة أخرى
            print(f"Critical Error in process_and_generate: {e}")
            return Response({"error": f"A critical server error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)