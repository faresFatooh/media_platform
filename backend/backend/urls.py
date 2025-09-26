from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.http import HttpResponse

def health_check(request):
    return HttpResponse(status=200)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('health/', health_check, name='health_check'),

    # --- الروابط الأساسية ---
    path('api/users/', include('users.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # --- روابط التطبيقات التي أبقينا عليها ---
    path('api/applications/', include('applications.urls')),
    path('api/tasks/', include('tasks.urls')),
    path('api/news-generator/', include('news_generator.urls')),
]