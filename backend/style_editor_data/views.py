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

            # جلب آخر 10 أمثلة فقط للبقاء ضمن حدود الاستخدام
            user_examples = StyleExample.objects.filter(user=request.user).order_by('-id')[:10]
            example_prompts = "\n\n".join([f"Original: {ex.before_text}\nEdited: {ex.after_text}" for ex in user_examples])
            
            # --- التعليمات الجديدة والمفصلة باللغة الإنجليزية ---
            prompt = f"""
You are an expert Arabic news editor and content analyst. Your task is to edit the "Original Text" below according to two main instructions:

1. General Style: First, you must adhere to the general writing style illustrated in the "Style Examples" below. Pay attention to the text's tone, sentence structure, and vocabulary, and preserve them from the original text as much as possible, while shortening by eliminating marginal words and words that can be deleted without affecting the sentence's meaning, idea, and clarity.

2. Paragraphs containing dense and important information should be in the form of graphic points. This sometimes includes information from experts or analysts. You must extract and gather the main and similar pieces of information that serve a single idea from those quotes and rephrase them into a concise bulleted list (using - for each point). This list should be naturally integrated into the text with a one or two-line introduction as a lead-in.

3. Rule for converting quotes to points (very important): If the "Original Text" contains direct quotes from an official, a deputy, an important political figure, a very important person, or a member of parliament, for example, and their speech is within brackets like these «...», the quote must be placed, then the speaker's name below it, and their title below that.

And here are additional guidelines for my writing style:

- Names often remain complete.
- Months remain written in two forms.
- The text is divided into paragraphs, each about a single idea, and each paragraph ends with /////.
- The beginning of each paragraph that discusses a new idea should be a nominal sentence.
- Sentences that are quotes from people remain as they are with the brackets as they are, with the speaker's name placed below it and the word "جرافيك" written above it.

Characteristics of your editing style:
1. Structure and Organization:
• Divide the text into very short paragraphs (one or two lines).
• Use a forward slash (/) as a separator between sentences and ideas.
• Separate sections with multiple lines (///).
• Hierarchical arrangement of information from most important to least important.

2. Visual Techniques:
• Use the word "جرافيك" to highlight important information.
• Place quotes in separate boxes with the source mentioned.
• Use bullets (•) to present information in lists.
• Rely on visual white space to facilitate reading.

3. Linguistic Style:
• Short, direct sentences free of filler.
• Start directly with the main news without introductions.
• Use the present tense for vitality and immediacy.
• Avoid excessive adjectives and focus on facts.

4. Narrative Techniques:
• Ask interrogative questions to attract attention.
• Use suspense (e.g., "But what is the secret of...?").
• Smooth transitions between paragraphs with logical connectors.
• End sections with exciting information or paradoxes.

5. Information Processing:
• Convert long paragraphs into specific points.
• Extract numbers and statistics and place them in a clear context.
• Simplify complex terms.
• Focus on the human and dramatic aspects of the story.

6. Headlines and Intros:
• Catchy headlines that contain elements of suspense.
• Use question marks in headlines.
• Mention key names at the beginning of the text.

7. Balance:
• Mix serious information with light or exciting elements.
• Diversify between quotes, narrative, and information.
• Do not dwell on any part at the expense of another.

Style Examples:
---
{example_prompts}
---

Now, apply all these rules meticulously to the following text.
Original Text: {raw_text}
"""
            # --- نهاية التعليمات ---

            message = client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=4096, # تمت زيادة الحد الأقصى للنص الأطول
                messages=[{"role": "user", "content": prompt}]
            )
            edited_text = message.content[0].text
            
            return Response({"edited_text": edited_text})
            
        except Exception as e:
            print(f"Error during predict execution: {e}")
            return Response({"error": f"An error occurred while communicating with the AI model: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)