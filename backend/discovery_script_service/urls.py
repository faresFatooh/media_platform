from django.urls import path
from .views import ApiConfigView

urlpatterns = [
    path("configs/", ApiConfigView.as_view(), name="api-configs"),
]
