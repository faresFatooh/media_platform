from rest_framework import serializers
from .models import ApiConfig

class ApiConfigSerializer(serializers.ModelSerializer):
    # This tells Django: the field "claudeApiKey" from the JSON
    # should be saved to the "claude_api_key" field in our database.
    claudeApiKey = serializers.CharField(source='claude_api_key', allow_blank=True, required=False)
    chatGptApiKey = serializers.CharField(source='chatgpt_api_key', allow_blank=True, required=False)
    
    # This ensures we can see the username when we fetch the data
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = ApiConfig
        # These are the fields the API will accept and return.
        # Use the camelCase version for frontend consistency.
        fields = ['user', 'claudeApiKey', 'chatGptApiKey', 'updated_at']