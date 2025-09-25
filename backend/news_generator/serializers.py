from rest_framework import serializers
from .models import EditorialStyle, CustomNewsSource, MonitoredSource

class EditorialStyleSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = EditorialStyle
        fields = '__all__'


class CustomNewsSourceSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = CustomNewsSource
        fields = '__all__'


class MonitoredSourceSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = MonitoredSource
        fields = '__all__'
