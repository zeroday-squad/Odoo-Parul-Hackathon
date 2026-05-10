from django.contrib import admin
from .models import CommunityPost


@admin.register(CommunityPost)
class CommunityPostAdmin(admin.ModelAdmin):
    list_display = ('user', 'trip', 'likes', 'created_at')
    search_fields = ('user__email', 'content', 'trip__name')
    ordering = ('-created_at',)
    readonly_fields = ('likes', 'created_at')
