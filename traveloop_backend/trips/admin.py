from django.contrib import admin
from .models import Trip, Stop, StopActivity


class StopActivityInline(admin.TabularInline):
    model = StopActivity
    extra = 0
    autocomplete_fields = ['activity']


class StopInline(admin.StackedInline):
    model = Stop
    extra = 0
    show_change_link = True
    fields = ('city', 'arrival_date', 'departure_date', 'budget', 'notes', 'order_index')


@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'start_date', 'end_date', 'status', 'is_public', 'created_at')
    list_filter = ('is_public',)
    search_fields = ('name', 'user__email', 'user__first_name')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at', 'status')
    inlines = [StopInline]

    def status(self, obj):
        return obj.status
    status.short_description = 'Status'


@admin.register(Stop)
class StopAdmin(admin.ModelAdmin):
    list_display = ('trip', 'city', 'arrival_date', 'departure_date', 'budget', 'order_index')
    list_filter = ('city__country',)
    search_fields = ('trip__name', 'city__name')
    ordering = ('trip', 'order_index')
    autocomplete_fields = ['city']
    inlines = [StopActivityInline]


@admin.register(StopActivity)
class StopActivityAdmin(admin.ModelAdmin):
    list_display = ('stop', 'activity', 'scheduled_time')
    search_fields = ('stop__trip__name', 'activity__name')
    autocomplete_fields = ['activity']
