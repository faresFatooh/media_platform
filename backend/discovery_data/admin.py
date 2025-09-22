from django.contrib import admin
from .models import DiscoveryScript

# This code registers the DiscoveryScript model with the Django admin site.
# The ModelAdmin class adds powerful features like search, filtering, and a better list view.
@admin.register(DiscoveryScript)
class DiscoveryScriptAdmin(admin.ModelAdmin):
    list_display = ('title', 'program', 'owner', 'created_at', 'updated_at')
    list_filter = ('program', 'owner')
    search_fields = ('title', 'content')