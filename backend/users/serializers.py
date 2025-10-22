from django.contrib.auth.models import User
from rest_framework import serializers, validators

class RegisterSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(
        choices=[('user', 'User'), ('admin', 'Admin')],
        default='user',
        write_only=True
    )

    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'first_name', 'last_name', 'role')
        extra_kwargs = {
            "password": {"write_only": True},
            "email": {
                "required": True,
                "allow_blank": False,
                "validators": [
                    validators.UniqueValidator(User.objects.all(), "A user with that Email already exists.")
                ],
            },
        }

    def create(self, validated_data):
        role = validated_data.pop('role', 'user')
        is_staff = True if role == 'admin' else False
        is_superuser = True if role == 'admin' else False  # اختياري لو تريد صلاحيات كاملة
        user = User.objects.create_user(**validated_data, is_staff=is_staff, is_superuser=is_superuser)
        return user
