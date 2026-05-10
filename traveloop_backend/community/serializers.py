from rest_framework import serializers
from .models import CommunityPost
from accounts.serializers import UserSerializer
from trips.serializers import TripSerializer

class CommunityPostSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    trip_details = TripSerializer(source='trip', read_only=True)
    
    class Meta:
        model = CommunityPost
        fields = '__all__'
        read_only_fields = ['user', 'likes']
