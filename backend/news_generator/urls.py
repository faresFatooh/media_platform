from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import MonitoredSourceListCreateView


router = DefaultRouter()
router.register(r'styles', views.EditorialStyleViewSet, basename='editorialstyle')
router.register(r'custom-sources', views.CustomNewsSourceViewSet, basename='customnewssource')
router.register(r'monitored-sources', views.MonitoredSourceViewSet, basename='monitoredsource')


urlpatterns = [
    path('', include(router.urls)),
    path("generate-article/", views.GenerateArticleView.as_view(), name="generate_article"),
    path("generate-image/", views.GenerateImageView.as_view(), name="generate_image"),
    path("monitored-sources/", MonitoredSourceListCreateView.as_view(), name="monitored_sources"),
    path("api/", include("news_generator.urls")),  # <--- مهم


]
