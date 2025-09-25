from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EditorialStyleViewSet,
    CustomNewsSourceViewSet,
    MonitoredSourceViewSet,
    GenerateArticleView,
    GenerateImageView,
)

router = DefaultRouter()
router.register(r'editorial-styles', EditorialStyleViewSet, basename='editorialstyle')
router.register(r'custom-sources', CustomNewsSourceViewSet, basename='customsource')
router.register(r'monitored-sources', MonitoredSourceViewSet, basename='monitoredsource')

urlpatterns = [
    path('', include(router.urls)),
    path("generate-article/", GenerateArticleView.as_view(), name="generate_article"),
    path("generate-image/", GenerateImageView.as_view(), name="generate_image"),
]
