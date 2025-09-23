from rest_framework import serializers
from .models import ApiConfig

class ApiConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApiConfig
        fields = ["claude_api_key", "chatgpt_api_key", "updated_at"]
