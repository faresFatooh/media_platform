from django.contrib import admin
from .models import (
    Style, TrainingData, TrainingExample,
    Script, ApiConfig, Scene, Source, ProjectAsset
)

@admin.register(Style)
class StyleAdmin(admin.ModelAdmin):
    list_display = ('id', 'owner', 'name', 'is_default', 'created_at')
    search_fields = ('name', 'owner__username')
    list_filter = ('is_default', 'created_at')

@admin.register(TrainingData)
class TrainingDataAdmin(admin.ModelAdmin):
    list_display = ('style', 'method')
    search_fields = ('style__name', 'method')

@admin.register(TrainingExample)
class TrainingExampleAdmin(admin.ModelAdmin):
    list_display = ('id', 'training_data', 'order')
    search_fields = ('before_text', 'after_text')

@admin.register(Script)
class ScriptAdmin(admin.ModelAdmin):
    list_display = ('id', 'owner', 'title', 'language', 'created_at')
    search_fields = ('title', 'owner__username')
    list_filter = ('language', 'created_at')

@admin.register(ApiConfig)
class ApiConfigAdmin(admin.ModelAdmin):
    list_display = ('user', 'updated_at')

@admin.register(Scene)
class SceneAdmin(admin.ModelAdmin):
    list_display = ('id', 'script', 'order', 'time_code')

@admin.register(Source)
class SourceAdmin(admin.ModelAdmin):
    list_display = ('id', 'script', 'name', 'url')

@admin.register(ProjectAsset)
class ProjectAssetAdmin(admin.ModelAdmin):
    list_display = ('id', 'script', 'asset_type', 'original_filename', 'uploaded_at')
