from rest_framework import viewsets, generics, status, filters
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Trip, Stop, StopActivity
from .serializers import TripSerializer, StopSerializer, StopActivitySerializer
from datetime import date

class TripViewSet(viewsets.ModelViewSet):
    serializer_class = TripSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description', 'short_name']

    def get_queryset(self):
        qs = Trip.objects.filter(user=self.request.user)
        status_param = self.request.query_params.get('status')
        if status_param:
            today = date.today()
            if status_param == 'ongoing':
                qs = qs.filter(start_date__lte=today, end_date__gte=today)
            elif status_param == 'upcoming':
                qs = qs.filter(start_date__gt=today)
            elif status_param == 'completed':
                qs = qs.filter(end_date__lt=today)
        return qs.order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        # Handle multipart/form-data by allowing partial when is_public field alone is sent
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

class PublicTripView(generics.RetrieveAPIView):
    queryset = Trip.objects.filter(is_public=True)
    serializer_class = TripSerializer
    permission_classes = [AllowAny]

class StopListCreateView(generics.ListCreateAPIView):
    serializer_class = StopSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Stop.objects.filter(trip_id=self.kwargs['trip_pk'], trip__user=self.request.user)

    def perform_create(self, serializer):
        trip = get_object_or_404(Trip, pk=self.kwargs['trip_pk'], user=self.request.user)
        last_stop = trip.stops.order_by('-order_index').first()
        order_index = last_stop.order_index + 1 if last_stop else 0
        serializer.save(trip=trip, order_index=order_index)

class StopDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = StopSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Stop.objects.filter(trip__user=self.request.user)

class StopActivityListCreateView(generics.ListCreateAPIView):
    serializer_class = StopActivitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return StopActivity.objects.filter(stop_id=self.kwargs['stop_pk'], stop__trip__user=self.request.user)

    def perform_create(self, serializer):
        stop = get_object_or_404(Stop, pk=self.kwargs['stop_pk'], trip__user=self.request.user)
        serializer.save(stop=stop)

class StopActivityDetailView(generics.DestroyAPIView):
    serializer_class = StopActivitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return StopActivity.objects.filter(stop__trip__user=self.request.user)

class ReorderStopsView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, trip_pk):
        trip = get_object_or_404(Trip, pk=trip_pk, user=request.user)
        stop_ids = request.data.get('stop_ids', [])
        for index, stop_id in enumerate(stop_ids):
            Stop.objects.filter(id=stop_id, trip=trip).update(order_index=index)
        return Response({'status': 'reordered'})
