from django.db import models
from django.contrib.auth.models import User
from datetime import date
from places.models import City, Activity

class Trip(models.Model):
    STATUS_CHOICES = [
        ('ongoing', 'Ongoing'),
        ('upcoming', 'Upcoming'),
        ('completed', 'Completed')
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trips')
    name = models.CharField(max_length=200)
    short_name = models.CharField(max_length=50, blank=True)
    description = models.TextField(blank=True)
    start_date = models.DateField()
    end_date = models.DateField()
    is_public = models.BooleanField(default=False)
    cover_photo = models.ImageField(upload_to='trips/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def status(self):
        today = date.today()
        if self.end_date < today:
            return 'completed'
        elif self.start_date > today:
            return 'upcoming'
        else:
            return 'ongoing'

    def __str__(self):
        return self.name

class Stop(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='stops')
    city = models.ForeignKey(City, on_delete=models.SET_NULL, null=True, related_name='stops')
    order_index = models.IntegerField(default=0)
    arrival_date = models.DateField()
    departure_date = models.DateField()
    notes = models.TextField(blank=True)
    budget = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    class Meta:
        ordering = ['order_index']

    def __str__(self):
        return f"{self.trip.name} - {self.city.name if self.city else 'Unknown'}"

class StopActivity(models.Model):
    stop = models.ForeignKey(Stop, on_delete=models.CASCADE, related_name='stop_activities')
    activity = models.ForeignKey(Activity, on_delete=models.CASCADE)
    scheduled_time = models.TimeField(null=True, blank=True)
    custom_notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.stop} - {self.activity.name}"
