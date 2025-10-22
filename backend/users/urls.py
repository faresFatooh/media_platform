from django.urls import path
# ---==[ تعديل ]==---
# استيراد الـ View المخصصة بدلاً من الافتراضية
from .views import RegisterAPI, CurrentUserAPI, MyTokenObtainPairView
# ---==[ نهاية التعديل ]==---

# لم نعد بحاجة لهذا السطر
# from rest_framework_simplejwt.views import TokenObtainPairView 

urlpatterns = [
    path('register/', RegisterAPI.as_view()),  # تسجيل مستخدم جديد
    path('me/', CurrentUserAPI.as_view()),     # بيانات المستخدم الحالي
    
    # ---==[ تعديل ]==---
    # استخدام الـ View المخصصة التي تعيد الدور (role)
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),  # JWT login
    # ---==[ نهاية التعديل ]==---
]