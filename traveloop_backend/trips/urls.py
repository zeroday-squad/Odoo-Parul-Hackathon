from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TripViewSet, PublicTripView, StopListCreateView, StopDetailView,
    StopActivityListCreateView, StopActivityDetailView, ReorderStopsView
)

router = DefaultRouter()
router.register(r'trips', TripViewSet, basename='trip')

urlpatterns = [
    path('', include(router.urls)),
    path('trips/<int:pk>/public/', PublicTripView.as_view(), name='public-trip'),
    path('trips/<int:trip_pk>/stops/', StopListCreateView.as_view(), name='stop-list'),
    path('trips/<int:trip_pk>/reorder-stops/', ReorderStopsView.as_view(), name='reorder-stops'),
    path('stops/<int:pk>/', StopDetailView.as_view(), name='stop-detail'),
    path('stops/<int:stop_pk>/activities/', StopActivityListCreateView.as_view(), name='stop-activity-list'),
    path('stops/<int:stop_pk>/activities/<int:pk>/', StopActivityDetailView.as_view(), name='stop-activity-detail'),
]
