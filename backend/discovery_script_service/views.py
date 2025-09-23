from rest_framework import viewsets, permissions
from .models import ApiConfig
from .serializers import ApiConfigSerializer # <-- ١. استورد الـ Serializer الجديد

class ApiConfigViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ApiConfigSerializer # <-- ٢. عيّنه كلاسًا للاستخدام

    def get_queryset(self):
        # هذا يجلب الإعدادات الخاصة بالمستخدم المسجل دخوله فقط
        return ApiConfig.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # هذا ينشئ أو يحدّث الإعدادات للمستخدم المسجل دخوله
        serializer.save(user=self.request.user)