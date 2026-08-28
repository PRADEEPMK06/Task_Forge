import secrets
import string
from django.db import models
from django.conf import settings

def generate_organization_code():
    """Generate a unique, unguessable organization code like TF-ORG-8F42K9."""
    chars = string.ascii_uppercase + string.digits
    random_part = ''.join(secrets.choice(chars) for _ in range(6))
    return f"TF-ORG-{random_part}"

class Organization(models.Model):
    """
    Organization model representing the enterprise workspace.
    """
    name = models.CharField(max_length=255, db_index=True)
    description = models.TextField(blank=True, default='')
    organization_code = models.CharField(
        max_length=32,
        unique=True,
        db_index=True,
        default=generate_organization_code,
        editable=False,
        help_text="Unique enterprise code for the organization"
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_organizations'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Organization'
        verbose_name = 'Organizations'

    def __str__(self):
        return f"{self.name} ({self.organization_code})"
