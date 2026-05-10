from django.contrib import admin
from .models import City, Activity


class ActivityInline(admin.TabularInline):
    model = Activity
    extra = 1
    fields = ('name', 'type', 'cost', 'duration_hours', 'description')


@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    list_display = ('name', 'country', 'region', 'cost_index', 'popularity')
    list_filter = ('region', 'country')
    search_fields = ('name', 'country', 'region')
    ordering = ('-popularity',)
    inlines = [ActivityInline]
    fieldsets = (
        (None, {
            'fields': ('name', 'country', 'region')
        }),
        ('Details', {
            'fields': ('description', 'cover_image', 'cost_index', 'popularity')
        }),
    )


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ('name', 'city', 'type', 'cost', 'duration_hours')
    list_filter = ('type', 'city__region', 'city__country')
    search_fields = ('name', 'city__name', 'description')
    ordering = ('city', 'name')
    autocomplete_fields = ['city']
