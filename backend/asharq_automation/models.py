from django.db import models
from django.contrib.auth.models import User

class NewsArticle(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    source_url = models.URLField(max_length=500, blank=True, null=True)
    original_text = models.TextField()
    topic = models.CharField(max_length=100, default="Palestine") # مثال: فلسطين
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Article on {self.topic} by {self.user.username}"

# هذا الجدول سيخزن المنشورات المولدة لكل منصة
class GeneratedPost(models.Model):
    PLATFORM_CHOICES = [
        ('Facebook', 'Facebook'),
        ('X', 'X (Twitter)'),
        ('LinkedIn', 'LinkedIn'),
        ('Instagram', 'Instagram'),
        # ... يمكن إضافة المزيد
    ]

    article = models.ForeignKey(NewsArticle, on_delete=models.CASCADE, related_name='posts')
    platform = models.CharField(max_length=50, choices=PLATFORM_CHOICES)
    content = models.TextField()
    status = models.CharField(max_length=20, default='draft') # draft, scheduled, published
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.platform} post for article {self.article.id}"