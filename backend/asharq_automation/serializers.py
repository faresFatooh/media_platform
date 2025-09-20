from rest_framework import serializers
from .models import NewsArticle, GeneratedPost

class GeneratedPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeneratedPost
        fields = ['id', 'platform', 'content', 'status', 'created_at']

class NewsArticleSerializer(serializers.ModelSerializer):
    posts = GeneratedPostSerializer(many=True, read_only=True)
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = NewsArticle
        # --- هذا هو التعديل الرئيسي ---
        # لقد قمنا بإضافة الحقلين الجديدين إلى قائمة "التغليف"
        fields = [
            'id', 
            'user', 
            'source_url', 
            'original_text', 
            'topic', 
            'created_at', 
            'posts', 
            'edited_text',  # <-- تمت إضافته
            'image_url'     # <-- تمت إضافته
        ]