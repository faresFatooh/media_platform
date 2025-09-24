from django.urls import path
from .views import RegisterAPI, CurrentUserAPI

urlpatterns = [
    path('register/', RegisterAPI.as_view()),  # تسجيل مستخدم جديد
    path('me/', CurrentUserAPI.as_view()),    # بيانات المستخدم الحالي
]
