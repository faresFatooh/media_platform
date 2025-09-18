from django.db import models
from django.contrib.auth.models import User

class StyleExample(models.Model):
    """
    Represents a single training example (before/after pair) for the style editor.
    """
    # The user who created this example. Can be used for multi-tenancy later.
    # For now, we allow it to be optional.
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)

    # The text before editing (e.g., "التقرير لازم يتسلم بكرة")
    before_text = models.TextField()

    # The text after editing (e.g., "يجب تسليم التقرير صباح الغد")
    after_text = models.TextField()

    # The date this example was created
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Example from {self.user.username if self.user else "System"}: "{self.before_text[:50]}..."'