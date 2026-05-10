from django.db import models

class City(models.Model):
    name = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    region = models.CharField(max_length=100)
    cost_index = models.FloatField(default=1.0)
    popularity = models.IntegerField(default=50)
    cover_image = models.ImageField(upload_to='cities/', null=True, blank=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.name}, {self.country}"

class Activity(models.Model):
    TYPE_CHOICES = [
        ('sightseeing', 'Sightseeing'),
        ('food', 'Food'),
        ('adventure', 'Adventure'),
        ('culture', 'Culture'),
        ('physical', 'Physical')
    ]
    city = models.ForeignKey(City, on_delete=models.CASCADE, related_name='activities')
    name = models.CharField(max_length=200)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    cost = models.DecimalField(max_digits=8, decimal_places=2)
    duration_hours = models.FloatField()
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name
