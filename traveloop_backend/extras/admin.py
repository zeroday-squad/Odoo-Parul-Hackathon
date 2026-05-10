from django.contrib import admin
from .models import Expense, ChecklistItem, Note


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('label', 'trip', 'category', 'amount', 'date')
    list_filter = ('category',)
    search_fields = ('label', 'trip__name')
    ordering = ('-date',)


@admin.register(ChecklistItem)
class ChecklistItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'trip', 'category', 'is_packed', 'created_at')
    list_filter = ('category', 'is_packed')
    search_fields = ('name', 'trip__name')
    ordering = ('trip', 'category', 'name')


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ('trip', 'stop', 'created_at', 'reminder_time')
    search_fields = ('trip__name', 'content')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
