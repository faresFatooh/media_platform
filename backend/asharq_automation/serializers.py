from rest_framework import serializers
from .models import NewsArticle, GeneratedPost

class GeneratedPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeneratedPost
        fields = ['id', 'platform', 'content', 'status']

class NewsArticleSerializer(serializers.ModelSerializer):
    posts = GeneratedPostSerializer(many=True, read_only=True)

    class Meta:
        model = NewsArticle
        fields = ['id', 'source_url', 'original_text', 'topic', 'posts']