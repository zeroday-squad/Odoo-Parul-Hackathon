from rest_framework import generics, filters
from .models import City, Activity
from .serializers import CitySerializer, ActivitySerializer

class CityListView(generics.ListAPIView):
    serializer_class = CitySerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'country', 'region']
    ordering_fields = ['popularity', 'cost_index']

    def get_queryset(self):
        queryset = City.objects.all()
        country = self.request.query_params.get('country')
        region = self.request.query_params.get('region')
        if country:
            queryset = queryset.filter(country=country)
        if region:
            queryset = queryset.filter(region=region)
        return queryset

class CityDetailView(generics.RetrieveAPIView):
    queryset = City.objects.all()
    serializer_class = CitySerializer

class ActivityListView(generics.ListAPIView):
    serializer_class = ActivitySerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'type', 'description']

    def get_queryset(self):
        queryset = Activity.objects.all()
        city = self.request.query_params.get('city')
        type_param = self.request.query_params.get('type')
        max_cost = self.request.query_params.get('max_cost')
        duration = self.request.query_params.get('duration')
        
        if city:
            queryset = queryset.filter(city_id=city)
        if type_param:
            queryset = queryset.filter(type=type_param)
        if max_cost:
            queryset = queryset.filter(cost__lte=max_cost)
        if duration:
            if duration == 'Under 2h':
                queryset = queryset.filter(duration_hours__lt=2)
            elif duration == '2-4h':
                queryset = queryset.filter(duration_hours__gte=2, duration_hours__lte=4)
            elif duration == '4h+':
                queryset = queryset.filter(duration_hours__gt=4)
        return queryset
