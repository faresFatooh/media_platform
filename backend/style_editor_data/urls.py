from rest_framework.routers import DefaultRouter
from .views import StyleExampleViewSet

router = DefaultRouter()
router.register(r'', StyleExampleViewSet, basename='styleexample')
urlpatterns = router.urls