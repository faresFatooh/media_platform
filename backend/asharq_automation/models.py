from django.db import models
from django.contrib.auth.models import User

class NewsArticle(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    source_url = models.URLField(max_length=1024, blank=True, null=True)
    original_text = models.TextField()
    topic = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # --- الحقول الجديدة ---
    edited_text = models.TextField(blank=True, null=True) # لتخزين النص بعد التحرير
    image_url = models.URLField(max_length=2048, blank=True, null=True) # لتخزين رابط الصورة المولدة

    def __str__(self):
        return f"{self.topic} - {self.id}"

class GeneratedPost(models.Model):
    PLATFORM_CHOICES = [
        ('Facebook', 'Facebook'),
        ('X', 'X'),
        ('Instagram', 'Instagram'),
        ('LinkedIn', 'LinkedIn'),
        ('Threads', 'Threads'),
        ('TikTok', 'TikTok'),
        ('YouTube_Shorts', 'YouTube Shorts'),
        ('Telegram', 'Telegram'),
    ]
    
    article = models.ForeignKey(NewsArticle, related_name='posts', on_delete=models.CASCADE)
    platform = models.CharField(max_length=50, choices=PLATFORM_CHOICES)
    content = models.TextField()
    status = models.CharField(max_length=50, default='draft')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.platform} post for article {self.article.id}"