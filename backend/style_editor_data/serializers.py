from rest_framework import serializers
from .models import StyleExample

class StyleExampleSerializer(serializers.ModelSerializer):
    class Meta:
        model = StyleExample
        fields = ['id', 'user', 'before_text', 'after_text']
        read_only_fields = ['user']
