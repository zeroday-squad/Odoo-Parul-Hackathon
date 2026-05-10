from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['avatar', 'phone_number', 'language', 'bio']


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    is_staff = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'is_staff', 'profile']


class RegisterSerializer(serializers.Serializer):
    """Standalone serializer — not ModelSerializer — so we control every field."""
    first_name    = serializers.CharField(required=True, max_length=150)
    last_name     = serializers.CharField(required=True, max_length=150)
    email         = serializers.EmailField(required=True)
    password      = serializers.CharField(required=True, write_only=True, min_length=8)
    phone_number  = serializers.CharField(required=False, allow_blank=True, max_length=20)

    def validate_email(self, value):
        """Reject duplicate emails immediately with a clear message."""
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('An account with this email already exists.')
        return value.lower()

    def validate_first_name(self, value):
        if not value.strip():
            raise serializers.ValidationError('First name cannot be blank.')
        return value.strip()

    def validate_last_name(self, value):
        if not value.strip():
            raise serializers.ValidationError('Last name cannot be blank.')
        return value.strip()

    def validate_phone_number(self, value):
        if value and not value.replace('+', '').replace('-', '').replace(' ', '').isdigit():
            raise serializers.ValidationError('Enter a valid phone number.')
        return value

    def validate_password(self, value):
        try:
            validate_password(value)
        except Exception as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def create(self, validated_data):
        phone_number = validated_data.pop('phone_number', '')
        user = User.objects.create_user(
            username=validated_data['email'].lower(),
            email=validated_data['email'].lower(),
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
        )
        # Profile is auto-created via signal; update phone
        user.profile.phone_number = phone_number
        user.profile.save()
        return user
