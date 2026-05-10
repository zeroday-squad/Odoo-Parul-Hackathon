from rest_framework import serializers
from .models import Expense, ChecklistItem, Note

class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = '__all__'
        # trip is set server-side in perform_create; stop is optional
        read_only_fields = ['trip']

class ChecklistItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChecklistItem
        fields = '__all__'
        # trip is set server-side in perform_create
        read_only_fields = ['trip']

class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = '__all__'
        # trip is set server-side in perform_create
        read_only_fields = ['trip']
