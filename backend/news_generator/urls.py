from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# The router automatically creates URLs for the ModelViewSets
router = DefaultRouter()
router.register(r'styles', views.EditorialStyleViewSet, basename='editorialstyle')
router.register(r'custom-sources', views.CustomNewsSourceViewSet, basename='customnewssource')
router.register(r'monitored-sources', views.MonitoredSourceViewSet, basename='monitoredsource')

# URLs for the function-based API Views
urlpatterns = [
    # Includes all the URLs from the router (e.g., /api/news_generator/styles/)
    path('', include(router.urls)),
    
    # Manually add the paths for the new generation views
    path("api/news_generator/generate-article/", views.GenerateArticleView.as_view(), name="generate_article"),
path("api/news_generator/generate-image/", views.GenerateImageView.as_view(), name="generate_image"),
]