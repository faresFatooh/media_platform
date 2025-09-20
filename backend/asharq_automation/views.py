from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import NewsArticle, GeneratedPost
from .serializers import NewsArticleSerializer
from django.conf import settings
import google.generativeai as genai
import json

# ... (تهيئة Gemini تبقى كما هي) ...

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

        if not (source_url or original_text):
            return Response({"error": "URL or text is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            text_model = genai.GenerativeModel("gemini-1.5-flash")
            
            # --- المهمة 1: تحليل وتلخيص الخبر ---
            content_to_parse = f"URL: {source_url}" if source_url else f'Text: "{original_text}"'
            parsing_prompt = f'Analyze this news content and return a JSON object with "headline" and "summary" keys. Content: {content_to_parse}'
            parsing_response = text_model.generate_content(parsing_prompt)
            parsed_data = json.loads(parsing_response.text.strip().replace('```json', '').replace('```', ''))

            # --- المهمة 2: تحرير وصياغة الملخص ---
            editing_prompt = f"You are an expert Arabic news editor. Rewrite the following summary to be clear, engaging, and ready for publication. Keep it neutral and journalistic in tone. Summary: '{parsed_data.get('summary')}'"
            editing_response = text_model.generate_content(editing_prompt)
            edited_summary = editing_response.text.strip()

            # --- المهمة 3: توليد صورة احترافية ---
            image_prompt_generation_prompt = f"Based on the headline '{parsed_data.get('headline')}', generate a short, descriptive, and photorealistic prompt for an AI image generator. The prompt should describe a news-style photograph in English."
            image_prompt_response = text_model.generate_content(image_prompt_generation_prompt)
            image_prompt = image_prompt_response.text.strip()
            
            # ملاحظة: في تطبيق حقيقي، ستقوم برفع الصورة المولدة إلى خدمة تخزين وتحصل على رابط
            generated_image_url = "https://source.unsplash.com/512x512/?news" # صورة افتراضية مؤقتًا

            # --- حفظ كل شيء في قاعدة البيانات ---
            article = NewsArticle.objects.create(
                user=request.user,
                source_url=source_url,
                original_text=original_text or parsed_data.get('summary', ''),
                topic=brand_id,
                edited_text=edited_summary,
                image_url=generated_image_url
            )

            # --- المهمة 4: توليد منشورات التواصل الاجتماعي ---
            generation_prompt = f"Based on the EDITED summary below, generate tailored captions in Arabic for these platforms: {', '.join(platforms)}. Your output MUST be a single, valid JSON object where keys are the platform names. If you cannot generate for a platform, its value must be a string explaining why. EDITED Summary: '{edited_summary}'"
            generation_response = text_model.generate_content(generation_prompt)
            cleaned_text = generation_response.text.strip().replace('```json', '').replace('```', '')
            generated_captions = json.loads(cleaned_text)

            posts_to_save = []
            for platform, content in generated_captions.items():
                valid_platform_name = next((p[0] for p in GeneratedPost.PLATFORM_CHOICES if p[0].lower() == platform.lower()), None)
                if valid_platform_name:
                    posts_to_save.append(GeneratedPost(article=article, platform=valid_platform_name, content=content))
            
            if posts_to_save:
                GeneratedPost.objects.bulk_create(posts_to_save)

            serializer = NewsArticleSerializer(article)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            print(f"Critical Error in process_and_generate: {e}")
            return Response({"error": f"A critical server error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)