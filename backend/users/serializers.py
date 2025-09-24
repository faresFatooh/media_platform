from django.contrib.auth.models import User
from rest_framework import serializers, validators

# ✅ Serializer للتسجيل
class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'first_name', 'last_name')
        extra_kwargs = {
            "password": {"write_only": True},
            "email": {
                "required": True,
                "allow_blank": False,
                "validators": [
                    validators.UniqueValidator(
                        User.objects.all(),
                        "A user with that Email already exists."
                    )
                ],
            },
        }

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


# ✅ Serializer لعرض بيانات المستخدم الحالي
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name")
