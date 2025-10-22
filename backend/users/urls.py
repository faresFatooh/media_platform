from django.urls import path
from .views import RegisterAPI, CurrentUserAPI
from rest_framework_simplejwt.views import TokenObtainPairView

urlpatterns = [
    path('register/', RegisterAPI.as_view()),  # تسجيل مستخدم جديد
    path('me/', CurrentUserAPI.as_view()),    # بيانات المستخدم الحالي
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  # JWT login
]
