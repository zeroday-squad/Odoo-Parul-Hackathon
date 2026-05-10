from django.db import models
from trips.models import Trip, Stop

class Expense(models.Model):
    CATEGORY_CHOICES = [
        ('transport', 'Transport'),
        ('stay', 'Stay'),
        ('food', 'Food'),
        ('activity', 'Activity'),
        ('other', 'Other')
    ]
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='expenses')
    stop = models.ForeignKey(Stop, on_delete=models.SET_NULL, null=True, blank=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    label = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()

    def __str__(self):
        return f"{self.label} - {self.amount}"

class ChecklistItem(models.Model):
    CATEGORY_CHOICES = [
        ('clothing', 'Clothing'),
        ('documents', 'Documents'),
        ('electronics', 'Electronics'),
        ('other', 'Other')
    ]
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='checklist_items')
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    is_packed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Note(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='notes')
    stop = models.ForeignKey(Stop, on_delete=models.SET_NULL, null=True, blank=True)
    content = models.TextField()
    reminder_time = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Note on {self.trip.name}"
