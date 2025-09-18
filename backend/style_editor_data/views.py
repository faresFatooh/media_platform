from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import StyleExample
from .serializers import StyleExampleSerializer

class StyleExampleViewSet(viewsets.ModelViewSet):
    serializer_class = StyleExampleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # فلترة الأمثلة لتظهر فقط الأمثلة الخاصة بالمستخدم الحالي
        return StyleExample.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # تعيين المستخدم الحالي تلقائيًا للمثال عند إنشائه
        serializer.save(user=self.request.user)