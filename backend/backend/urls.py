from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.http import HttpResponse
from .views import health_check


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/applications/', include('applications.urls')),
    path('api/tasks/', include('tasks.urls')),
    path('api/style-examples/', include('style_editor_data.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/asharq-automation/', include('asharq_automation.urls')),
    path("api/discovery-script/", include("discovery_script_service.urls")),
    path("health/", lambda request: JsonResponse({"status": "ok"})),  # ✅ health check

]
