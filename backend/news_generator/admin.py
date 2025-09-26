from django.contrib import admin
from .models import EditorialStyle, CustomNewsSource, MonitoredSource


@admin.register(EditorialStyle)
class EditorialStyleAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'updated_at')
    list_filter = ('user',)
    search_fields = ('name', 'content')


@admin.register(CustomNewsSource)
class CustomNewsSourceAdmin(admin.ModelAdmin):
    list_display = ('url', 'user', 'created_at')
    list_filter = ('user',)
    search_fields = ('url',)


@admin.register(MonitoredSource)
class MonitoredSourceAdmin(admin.ModelAdmin):
    list_display = ('url', 'user', 'created_at')
    list_filter = ('user',)
    search_fields = ('url',)
