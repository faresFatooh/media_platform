# backend/discovery_data/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DiscoveryScriptViewSet

# Create a router and register our viewset with it.
router = DefaultRouter()
router.register(r'scripts', DiscoveryScriptViewSet, basename='discoveryscript')

# The API URLs are now determined automatically by the router.
urlpatterns = [
    path('', include(router.urls)),
]