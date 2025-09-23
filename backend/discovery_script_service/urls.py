from django.urls import path
from .views import ApiConfigViewSet

# We define the specific routes for our ViewSet
urlpatterns = [
    path('configs/', ApiConfigViewSet.as_view({'get': 'list', 'post': 'create'}), name='api-configs'),
]