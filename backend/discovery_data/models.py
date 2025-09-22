from django.db import models
from django.contrib.auth.models import User

class DiscoveryScript(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    program = models.CharField(max_length=100)
    duration = models.CharField(max_length=20)
    language = models.CharField(max_length=10, default='ar')
    content = models.TextField()
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.owner.username})"