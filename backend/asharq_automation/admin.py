from django.contrib import admin
from .models import NewsArticle, GeneratedPost

@admin.register(NewsArticle)
class NewsArticleAdmin(admin.ModelAdmin):
    list_display = ('id', 'topic', 'user', 'source_url', 'created_at')
    list_filter = ('user__username', 'topic', 'created_at')
    search_fields = ('original_text', 'source_url', 'user__username')
    list_select_related = ('user',)

@admin.register(GeneratedPost)
class GeneratedPostAdmin(admin.ModelAdmin):
    list_display = ('id', 'platform', 'article_id', 'status', 'created_at')
    list_filter = ('platform', 'status', 'created_at')
    search_fields = ('content',)
    
    def article_id(self, obj):
        return obj.article.id