from django.db import models
from django.contrib.auth.models import User

class Style(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=10, default='🎨')
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class TrainingData(models.Model):
    style = models.OneToOneField(Style, on_delete=models.CASCADE, primary_key=True)
    method = models.CharField(max_length=20, default='instructions')
    instructions = models.TextField(blank=True, null=True)
    policy_url = models.URLField(blank=True, null=True)
    policy_text = models.TextField(blank=True, null=True)

class TrainingExample(models.Model):
    training_data = models.ForeignKey(TrainingData, related_name='examples', on_delete=models.CASCADE)
    before_text = models.TextField()
    after_text = models.TextField()
    order = models.PositiveIntegerField(default=0)

class Script(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    style = models.ForeignKey(Style, on_delete=models.SET_NULL, null=True)
    title = models.CharField(max_length=255)
    duration_minutes = models.PositiveIntegerField(default=22)
    language = models.CharField(max_length=10, default='ar')
    source_text = models.TextField(blank=True, null=True)
    generated_content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class ApiConfig(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    claude_api_key = models.CharField(max_length=255, blank=True)
    chatgpt_api_key = models.CharField(max_length=255, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

class Scene(models.Model):
    script = models.ForeignKey(Script, related_name='scenes', on_delete=models.CASCADE)
    time_code = models.CharField(max_length=20)
    description = models.TextField()
    visuals = models.TextField()
    order = models.PositiveIntegerField(default=0)

class Source(models.Model):
    script = models.ForeignKey(Script, related_name='sources', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    url = models.URLField()

class ProjectAsset(models.Model):
    script = models.ForeignKey(Script, related_name='assets', on_delete=models.CASCADE)
    asset_file = models.FileField(upload_to='project_assets/')
    asset_type = models.CharField(max_length=10, choices=[('image', 'Image'), ('video', 'Video'), ('audio', 'Audio')])
    original_filename = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)
