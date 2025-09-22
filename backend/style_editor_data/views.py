from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import StyleExample
from .serializers import StyleExampleSerializer
from django.conf import settings
import anthropic
import os

class StyleExampleViewSet(viewsets.ModelViewSet):
    serializer_class = StyleExampleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return StyleExample.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'], url_path='predict')
    def predict(self, request):
        try:
            # --- التهيئة المباشرة من الإعدادات ---
            api_key = settings.CLAUDE_API_KEY
            if not api_key:
                return Response({"error": "Claude API Key is not configured on the server."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            client = anthropic.Anthropic(api_key=api_key)
            # --- نهاية التهيئة ---

            raw_text = request.data.get('raw_text')
            if not raw_text:
                return Response({"error": "No text provided for editing."}, status=status.HTTP_400_BAD_REQUEST)

            user_examples = StyleExample.objects.filter(user=request.user)
            example_prompts = "\n\n".join([f"Original: {ex.before_text}\nEdited: {ex.after_text}" for ex in user_examples])
            
            prompt = f"""
            Here are examples of my preferred writing style:
            {example_prompts}

            Now, please edit the following text to match that style. Only return the edited text, with no extra commentary.
            Original: {raw_text}
            """

            message = client.messages.create(
                 model="claude-3-haiku-20240307",
                max_tokens=2048,
                messages=[{"role": "user", "content": prompt}]
            )
            edited_text = message.content[0].text
            
            return Response({"edited_text": edited_text})
            
        except Exception as e:
            print(f"Error during predict execution: {e}")
            return Response({"error": f"An error occurred while communicating with the AI model: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)