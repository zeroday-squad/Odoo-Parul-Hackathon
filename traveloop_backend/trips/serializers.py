from rest_framework import serializers
from .models import Trip, Stop, StopActivity
from places.serializers import CitySerializer, ActivitySerializer

class StopActivitySerializer(serializers.ModelSerializer):
    activity_details = ActivitySerializer(source='activity', read_only=True)

    class Meta:
        model = StopActivity
        fields = '__all__'
        # stop is set via perform_create, activity is sent by client
        read_only_fields = ['stop']

class StopSerializer(serializers.ModelSerializer):
    stop_activities = StopActivitySerializer(many=True, read_only=True)
    city_details = CitySerializer(source='city', read_only=True)

    class Meta:
        model = Stop
        fields = '__all__'
        # trip and order_index are both set server-side in perform_create
        read_only_fields = ['trip', 'order_index']

class TripSerializer(serializers.ModelSerializer):
    status = serializers.CharField(read_only=True)
    stops = StopSerializer(many=True, read_only=True)
    stop_count = serializers.IntegerField(source='stops.count', read_only=True)

    class Meta:
        model = Trip
        fields = '__all__'
        read_only_fields = ['user']
