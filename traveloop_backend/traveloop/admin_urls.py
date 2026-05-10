from django.urls import path
from .admin_views import AdminStatsView

urlpatterns = [
    path('', AdminStatsView.as_view(), name='admin-stats'),
]
