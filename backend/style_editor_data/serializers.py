from rest_framework import serializers
from .models import StyleExample

class StyleExampleSerializer(serializers.ModelSerializer):
    class Meta:
        model = StyleExample
        fields = ['id', 'before_text', 'after_text', 'created_at']
        read_only_fields = ('user',)