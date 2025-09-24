from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# The router automatically creates all the necessary URLs for us (GET, POST, DELETE, etc.)
router = DefaultRouter()
router.register(r'styles', views.EditorialStyleViewSet, basename='editorialstyle')
router.register(r'custom-sources', views.CustomNewsSourceViewSet, basename='customnewssource')
router.register(r'monitored-sources', views.MonitoredSourceViewSet, basename='monitoredsource')

urlpatterns = [
    path('', include(router.urls)),
]