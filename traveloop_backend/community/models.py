from django.db import models
from django.contrib.auth.models import User
from trips.models import Trip

class CommunityPost(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    trip = models.ForeignKey(Trip, on_delete=models.SET_NULL, null=True, blank=True)
    content = models.TextField()
    likes = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Post by {self.user.username}"
