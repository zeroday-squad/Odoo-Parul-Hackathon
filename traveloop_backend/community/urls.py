from django.urls import path
from .views import CommunityPostListView, CommunityPostLikeView

urlpatterns = [
    path('', CommunityPostListView.as_view(), name='community-list'),
    path('<int:pk>/like/', CommunityPostLikeView.as_view(), name='community-like'),
]
