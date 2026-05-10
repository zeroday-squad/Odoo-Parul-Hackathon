from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.contrib.auth.models import User
from trips.models import Trip
from places.models import City
from django.db.models import Count
from datetime import date
import calendar

class AdminStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        today = date.today()
        total_users = User.objects.count()
        total_trips = Trip.objects.count()
        total_cities = City.objects.count()
        
        active_trips = Trip.objects.filter(start_date__lte=today, end_date__gte=today).count()
        
        # Trips per month
        trips_per_month = []
        for i in range(5, -1, -1):
            m = today.month - i
            y = today.year
            if m <= 0:
                m += 12
                y -= 1
            count = Trip.objects.filter(created_at__year=y, created_at__month=m).count()
            trips_per_month.append({
                'month': f"{calendar.month_abbr[m]} {y}",
                'count': count
            })
            
        # Top cities
        top_cities_qs = City.objects.annotate(trip_count=Count('stops')).order_by('-trip_count')[:10]
        top_cities = [{'city_name': c.name, 'trip_count': c.trip_count} for c in top_cities_qs]
        
        # Recent trips
        recent_trips_qs = Trip.objects.select_related('user').order_by('-created_at')[:10]
        recent_trips = [{
            'user': t.user.email,
            'name': t.name,
            'start_date': t.start_date,
            'end_date': t.end_date,
            'status': t.status,
            'stops_count': t.stops.count()
        } for t in recent_trips_qs]

        return Response({
            'total_users': total_users,
            'total_trips': total_trips,
            'total_cities': total_cities,
            'active_trips': active_trips,
            'trips_per_month': trips_per_month,
            'top_cities': top_cities,
            'recent_trips': recent_trips
        })
