from django.db import models
from django.conf import settings

class ApprovalType(models.TextChoices):
    TASK_COMPLETION = 'TASK_COMPLETION', 'Task Completion Review'
    CROSS_LEVEL_DELEGATION = 'CROSS_LEVEL_DELEGATION', 'Cross-Level Task Delegation'

class ApprovalStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending Review'
    APPROVED = 'APPROVED', 'Approved'
    CHANGES_REQUESTED = 'CHANGES_REQUESTED', 'Changes Requested'
    REJECTED = 'REJECTED', 'Rejected'

class TaskApproval(models.Model):
    """
    Approval workflow record for tasks.
    Supports both standard completion sign-off and multi-tier cross-level parent delegation reviews.
    """
    task = models.ForeignKey(
        'tasks.Task',
        on_delete=models.CASCADE,
        related_name='approvals',
        db_index=True
    )
    approval_type = models.CharField(
        max_length=40,
        choices=ApprovalType.choices,
        default=ApprovalType.TASK_COMPLETION,
        db_index=True
    )
    approval_tier = models.PositiveIntegerField(
        default=1,
        help_text="Tier in approval hierarchy (1=Immediate Parent, 2=Grandparent / L1)"
    )
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='conducted_reviews',
        help_text="The supervisor/manager reviewing this request"
    )
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='submitted_approvals',
        help_text="The user who submitted this task or initiated delegation"
    )
    status = models.CharField(
        max_length=30,
        choices=ApprovalStatus.choices,
        default=ApprovalStatus.PENDING,
        db_index=True
    )
    comments = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Approval for Task #{self.task_id} - {self.get_status_display()}"
