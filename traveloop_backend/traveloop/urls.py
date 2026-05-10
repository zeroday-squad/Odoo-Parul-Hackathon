from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/', include('trips.urls')),
    path('api/', include('places.urls')),
    path('api/', include('extras.urls')),
    path('api/community/', include('community.urls')),
    path('api/admin/stats/', include('traveloop.admin_urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
