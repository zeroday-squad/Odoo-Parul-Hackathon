from django.urls import path
from .views import CityListView, CityDetailView, ActivityListView

urlpatterns = [
    path('cities/', CityListView.as_view(), name='city-list'),
    path('cities/<int:pk>/', CityDetailView.as_view(), name='city-detail'),
    path('activities/', ActivityListView.as_view(), name='activity-list'),
]
