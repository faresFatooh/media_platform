from rest_framework import serializers
from .models import EditorialStyle, CustomNewsSource, MonitoredSource


class EditorialStyleSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.id')

    class Meta:
        model = EditorialStyle
        fields = ['id', 'name', 'description', 'created_at', 'user']


class CustomNewsSourceSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.id')

    class Meta:
        model = CustomNewsSource
        fields = ['id', 'url', 'created_at', 'user']


class MonitoredSourceSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.id')

    class Meta:
        model = MonitoredSource
        fields = ['id', 'url', 'created_at', 'user']
