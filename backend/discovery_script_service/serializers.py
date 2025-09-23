from rest_framework import serializers
from .models import ApiConfig

class ApiConfigSerializer(serializers.ModelSerializer):
    # هذا السطر يخبر Django: الحقل المسمى "claudeApiKey" في كائن JSON
    # يجب أن يتم حفظه في حقل "claude_api_key" في نموذج قاعدة البيانات.
    claudeApiKey = serializers.CharField(source='claude_api_key', allow_blank=True, required=False)
    chatGptApiKey = serializers.CharField(source='chatgpt_api_key', allow_blank=True, required=False)
    
    # نحتاج أيضًا إلى إخبار الـ Serializer بشكل صريح بجلب اسم المستخدم للعرض
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = ApiConfig
        # هذه هي الحقول التي سيقبلها ويعيدها الـ API.
        fields = ['user', 'claudeApiKey', 'chatGptApiKey', 'updated_at']