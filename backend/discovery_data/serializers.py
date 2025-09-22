# backend/discovery_data/serializers.py

from rest_framework import serializers
from .models import DiscoveryScript

class DiscoveryScriptSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = DiscoveryScript
        fields = '__all__' # This will include all fields from your model