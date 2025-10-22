from django.urls import path
from .views import RegisterAPI, CurrentUserAPI, MyTokenObtainPairView


urlpatterns = [
    path('register/', RegisterAPI.as_view()),  # تسجيل مستخدم جديد
    path('me/', CurrentUserAPI.as_view()),     # بيانات المستخدم الحالي
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
]