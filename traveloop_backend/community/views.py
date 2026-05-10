from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import CommunityPost
from .serializers import CommunityPostSerializer

class CommunityPostListView(generics.ListCreateAPIView):
    queryset = CommunityPost.objects.all().order_by('-created_at')
    serializer_class = CommunityPostSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CommunityPostLikeView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            post = CommunityPost.objects.get(pk=pk)
            post.likes += 1
            post.save()
            return Response({'likes': post.likes})
        except CommunityPost.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
