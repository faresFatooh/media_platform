from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import StyleExample
from .serializers import StyleExampleSerializer
from django.conf import settings
import google.generativeai as genai

# تهيئة Gemini
try:
    if settings.GEMINI_API_KEY:
        genai.configure(api_key=settings.GEMINI_API_KEY)
    else:
        print("Warning: GEMINI_API_KEY not found in settings.")
except Exception as e:
    print(f"Warning: Gemini API key not configured. Error: {e}")

class StyleExampleViewSet(viewsets.ModelViewSet):
    serializer_class = StyleExampleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # جلب أمثلة المستخدم الحالي فقط
        return StyleExample.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # تعيين المستخدم تلقائيًا وحفظ المثال
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'], url_path='predict')
    def predict(self, request):
        """
        يستقبل نصًا خامًا ويستخدم أمثلة المستخدم المحفوظة لتحريره مع Gemini.
        """
        raw_text = request.data.get('raw_text')
        if not raw_text:
            return Response({"error": "No text provided for editing."}, status=status.HTTP_400_BAD_REQUEST)

        # جلب أمثلة التدريب الشخصية للمستخدم من قاعدة البيانات
        user_examples = StyleExample.objects.filter(user=request.user)
        
        example_prompts = "\n\n".join([f"Original: {ex.before_text}\nEdited: {ex.after_text}" for ex in user_examples])
        
        prompt = f"""
          You are an expert Arabic text editor. Your task is to edit the following text based on the provided style examples.
          Maintain the original meaning but improve the style, grammar, and clarity according to the examples.
          
          Here are the examples of the desired style:
          {example_prompts}
          
          Now, please edit this text in the same style:
          Original: {raw_text}
          Edited:
        """

        try:
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content(prompt)
            edited_text = response.text
            
            # TODO: Add Task logging here in a future step
            
            return Response({"edited_text": edited_text})
            
        except Exception as e:
            print(f"Error calling Gemini API: {e}")
            return Response({"error": f"An error occurred with the AI model: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)