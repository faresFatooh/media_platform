from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EditorialStyleViewSet, CustomNewsSourceViewSet, MonitoredSourceViewSet

router = DefaultRouter()
router.register(r'styles', EditorialStyleViewSet, basename='editorialstyle')
router.register(r'custom-sources', CustomNewsSourceViewSet, basename='customnewssource')
router.register(r'monitored-sources', MonitoredSourceViewSet, basename='monitoredsource')

urlpatterns = [
    path('', include(router.urls)),
]