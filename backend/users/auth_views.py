from rest_framework_simplejwt.views import TokenObtainPairView
# تأكد من المسار الصحيح لاستيراد السيريلايزر الجديد
from .serializers import MyTokenObtainPairSerializer 

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer