from django.urls import path
from .views import ApiConfigView

urlpatterns = [
    path("api/configs/", ApiConfigView.as_view(), name="api-configs"),
]
