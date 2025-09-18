from django.contrib import admin
from .models import StyleExample

@admin.register(StyleExample)
class StyleExampleAdmin(admin.ModelAdmin):
    list_display = ('before_text', 'after_text', 'user', 'created_at')
    search_fields = ('before_text', 'after_text')
    list_filter = ('user',)