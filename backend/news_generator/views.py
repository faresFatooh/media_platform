import os
import json
import google.generativeai as genai
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework import viewsets
from .models import EditorialStyle, CustomNewsSource, MonitoredSource
from .serializers import EditorialStyleSerializer, CustomNewsSourceSerializer, MonitoredSourceSerializer

# --- Existing ViewSets for Models ---

class IsOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user

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

# --- New API Views for AI Generation ---

try:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Warning: GEMINI_API_KEY environment variable not found.")
    genai.configure(api_key=api_key)
except Exception as e:
    print(f"Error configuring Google AI: {e}")

class GenerateArticleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        input_type = request.data.get('input_type')
        data = request.data.get('data')

        if not all([input_type, data]):
            return Response({"detail": "Missing 'input_type' or 'data'."}, status=status.HTTP_400_BAD_REQUEST)

        article_schema = {
            "title": "A compelling headline for the news article.",
            "content": "The full content of the news article, formatted with paragraphs using \\n.",
            "summaryPoints": ["A list of key summary points from the article."],
            "keywords": ["A list of relevant SEO keywords."],
            "sources": ["A list of potential sources. If from a URL, list it. Otherwise, state 'Original content'."],
            "socialMediaPosts": {
                "twitter": "A short, engaging post for Twitter/X.",
                "facebook": "A slightly longer, descriptive post for Facebook."
            }
        }
        
        prompt_parts = []
        text_prompt = ""

        try:
            if input_type == 'title':
                text_prompt = f"Generate a detailed news article based on the following headline: \"{data}\""
            elif input_type == 'text':
                text_prompt = f"Expand the following text into a full news article:\n\n---\n{data}\n---"
            elif input_type == 'url':
                 text_prompt = f"Summarize the content from the URL below and then generate a unique news article based on that summary. Do not plagiarize. URL: {data}"
            elif input_type == 'image':
                image_data = data
                prompt_parts.append({
                    "inline_data": {
                        "mime_type": image_data['mimeType'],
                        "data": image_data['base64']
                    }
                })
                text_prompt = "Analyze the provided image and generate a relevant news article about the event, object, or scene depicted."
            else:
                return Response({"detail": "Invalid input_type."}, status=status.HTTP_400_BAD_REQUEST)
            
            full_prompt = f"{text_prompt}\n\nIMPORTANT: You must return your response as a single, valid JSON object that adheres strictly to the following schema. Do not include any other text, explanations, or markdown formatting like ```json. Your response must only be the JSON object.\n\nJSON Schema:\n{json.dumps(article_schema)}"
            prompt_parts.insert(0, full_prompt)

            model = genai.GenerativeModel('gemini-1.5-flash-latest')
            response = model.generate_content(prompt_parts)
            
            cleaned_text = response.text.strip().replace("```json", "").replace("```", "").strip()
            article_json = json.loads(cleaned_text)

            return Response(article_json, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Error generating article: {e}")
            return Response({"detail": "An error occurred while communicating with the AI model."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class GenerateImageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        prompt = request.data.get('prompt')
        if not prompt:
            return Response({"detail": "Missing 'prompt'."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # --- Placeholder for Real Image Generation ---
            # The google-generativeai library does not support Imagen.
            # For production, you would use a library like google-cloud-aiplatform.
            # For now, we return a placeholder URL to ensure the frontend works.
            placeholder_text = prompt.replace(" ", "+")
            image_url = f"https://placehold.co/1024x576/0D1117/7DD3FC?text={placeholder_text}"
            
            return Response({"imageUrl": image_url}, status=status.HTTP_200_OK)
        
        except Exception as e:
            print(f"Error generating image placeholder: {e}")
            return Response({"detail": "An error occurred during image generation."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)