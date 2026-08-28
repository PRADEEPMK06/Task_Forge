from django.db import models
from django.conf import settings

class NotificationType(models.TextChoices):
    TASK_ASSIGNED = 'TASK_ASSIGNED', 'New Task Assigned'
    TASK_SUBMITTED = 'TASK_SUBMITTED', 'Task Submitted for Approval'
    TASK_APPROVED = 'TASK_APPROVED', 'Task Approved'
    CHANGES_REQUESTED = 'CHANGES_REQUESTED', 'Changes Requested'
    DEADLINE_APPROACHING = 'DEADLINE_APPROACHING', 'Deadline Approaching'
    COMMENT_ADDED = 'COMMENT_ADDED', 'New Comment on Task'

class Notification(models.Model):
    """
    Enterprise notification model for tracking alerts and activity updates.
    """
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
        db_index=True
    )
    notification_type = models.CharField(
        max_length=40,
        choices=NotificationType.choices,
        db_index=True
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    task = models.ForeignKey(
        'tasks.Task',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications'
    )
    is_read = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'is_read']),
        ]

    def __str__(self):
        return f"Notification for {self.recipient.username}: {self.title}"
