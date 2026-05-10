from rest_framework import serializers
from .models import City, Activity

class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = '__all__'

class CitySerializer(serializers.ModelSerializer):
    activities = ActivitySerializer(many=True, read_only=True)
    class Meta:
        model = City
        fields = '__all__'
