from django.contrib import admin
from .models import NewsArticle, GeneratedPost

@admin.register(NewsArticle)
class NewsArticleAdmin(admin.ModelAdmin):
    # نخبره هنا بعرض اسم المستخدم بدلاً من كائن المستخدم
    list_display = ('id', 'topic', 'get_username', 'source_url', 'created_at')
    list_filter = ('user__username', 'topic', 'created_at')
    search_fields = ('original_text', 'source_url', 'user__username')
    # هذا السطر مهم جدًا لتحسين أداء قاعدة البيانات وتقليل الاستعلامات
    list_select_related = ('user',)

    # دالة مخصصة لجلب اسم المستخدم بأمان
    @admin.display(description='User')
    def get_username(self, obj):
        return obj.user.username if obj.user else 'N/A'

@admin.register(GeneratedPost)
class GeneratedPostAdmin(admin.ModelAdmin):
    # نخبره هنا بعرض رقم المقال بدلاً من كائن المقال
    list_display = ('id', 'platform', 'get_article_id', 'status', 'created_at')
    list_filter = ('platform', 'status', 'created_at')
    search_fields = ('content',)
    # هذا السطر يحسن الأداء
    list_select_related = ('article',)

    # دالة مخصصة لجلب رقم المقال
    @admin.display(description='Article ID')
    def get_article_id(self, obj):
        return obj.article.id