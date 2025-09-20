from django.contrib import admin
from .models import NewsArticle, GeneratedPost

@admin.register(NewsArticle)
class NewsArticleAdmin(admin.ModelAdmin):
    list_display = ('id', 'topic', 'user', 'source_url', 'created_at')
    list_filter = ('user', 'topic', 'created_at')
    search_fields = ('original_text', 'source_url')

@admin.register(GeneratedPost)
class GeneratedPostAdmin(admin.ModelAdmin):
    list_display = ('id', 'platform', 'article', 'status', 'created_at')
    list_filter = ('platform', 'status', 'created_at')
    search_fields = ('content',)