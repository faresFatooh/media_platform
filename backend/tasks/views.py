from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Task
from .serializers import TaskSerializer

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # فلترة المهام لإظهار مهام المستخدم الحالي فقط
        return Task.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # تعيين المستخدم الحالي تلقائيًا للمهمة عند إنشائها
        serializer.save(user=self.request.user)