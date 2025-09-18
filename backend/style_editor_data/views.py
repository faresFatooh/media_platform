from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import StyleExample
from .serializers import StyleExampleSerializer
from django.conf import settings
from google.generativeai import GenerativeModel, configure

# Configure the Gemini client
try:
    configure(api_key=settings.GEMINI_API_KEY)
except Exception as e:
    print(f"Warning: Gemini API key not configured. Error: {e}")


class StyleExampleViewSet(viewsets.ModelViewSet):
    serializer_class = StyleExampleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only return examples created by the current user
        return StyleExample.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Automatically assign the current user when a new example is created
        serializer.save(user=self.request.user, before_text=self.request.data.get('raw'), after_text=self.request.data.get('edited'))

    @action(detail=False, methods=['post'])
    def predict(self, request):
        """
        Receives raw text and uses the user's saved examples to edit it with Gemini.
        """
        raw_text = request.data.get('raw_text')
        if not raw_text:
            return Response({"error": "No text provided for editing."}, status=status.HTTP_400_BAD_REQUEST)

        # Fetch the user's personal training examples from the database
        user_examples = StyleExample.objects.filter(user=request.user)
        
        # Build the prompt for the AI model
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
            model = GenerativeModel("gemini-1.5-flash")
            response = model.generate_content(prompt)
            edited_text = response.text
            
            # --- تسجيل المهمة في قاعدة البيانات ---
            # This part will be added in the next step to keep things clear
            # For now, we just return the result.
            
            return Response({"edited_text": editedText})
            
        except Exception as e:
            print(f"Error calling Gemini API: {e}")
            return Response({"error": f"An error occurred while communicating with the AI model: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)