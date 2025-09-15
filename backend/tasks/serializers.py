from rest_framework import serializers
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'
        # نجعل حقل المستخدم للقراءة فقط لأنه سيتم تعيينه تلقائيًا
        read_only_fields = ('user',)