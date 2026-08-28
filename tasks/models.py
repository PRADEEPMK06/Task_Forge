from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator

class TaskPriority(models.TextChoices):
    LOW = 'LOW', 'Low'
    MEDIUM = 'MEDIUM', 'Medium'
    HIGH = 'HIGH', 'High'
    CRITICAL = 'CRITICAL', 'Critical'

class TaskStatus(models.TextChoices):
    ASSIGNED = 'ASSIGNED', 'Assigned'
    PENDING_APPROVAL = 'PENDING_APPROVAL', 'Pending Parent Approval'
    IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
    SUBMITTED = 'SUBMITTED', 'Submitted for Review'
    UNDER_REVIEW = 'UNDER_REVIEW', 'Under Review'
    CHANGES_REQUESTED = 'CHANGES_REQUESTED', 'Changes Requested'
    APPROVED = 'APPROVED', 'Approved'
    COMPLETED = 'COMPLETED', 'Completed'
    REJECTED = 'REJECTED', 'Delegation Rejected'
    OVERDUE = 'OVERDUE', 'Overdue'

class Task(models.Model):
    """
    Enterprise Task model.
    Enforces that tasks can be assigned directly to subordinates, or across levels with parent multi-tier approval.
    """
    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.CASCADE,
        related_name='tasks',
        db_index=True
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='assigned_tasks',
        db_index=True
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='received_tasks',
        db_index=True
    )
    priority = models.CharField(
        max_length=20,
        choices=TaskPriority.choices,
        default=TaskPriority.MEDIUM,
        db_index=True
    )
    status = models.CharField(
        max_length=30,
        choices=TaskStatus.choices,
        default=TaskStatus.ASSIGNED,
        db_index=True
    )
    is_cross_level = models.BooleanField(
        default=False,
        help_text="True if assigned across hierarchy requiring parent chain approvals"
    )
    progress = models.PositiveIntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Task progress percentage (0-100)"
    )
    start_date = models.DateField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True, db_index=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['organization', 'status']),
            models.Index(fields=['assigned_to', 'status']),
            models.Index(fields=['assigned_by', 'status']),
            models.Index(fields=['due_date']),
        ]

    def __str__(self):
        return f"[{self.get_priority_display()}] {self.title} -> {self.assigned_to.display_name}"

class ActivityType(models.TextChoices):
    TASK_CREATED = 'TASK_CREATED', 'Task Created'
    TASK_ASSIGNED = 'TASK_ASSIGNED', 'Task Assigned'
    TASK_STARTED = 'TASK_STARTED', 'Task Started'
    PROGRESS_UPDATED = 'PROGRESS_UPDATED', 'Progress Updated'
    TASK_SUBMITTED = 'TASK_SUBMITTED', 'Task Submitted'
    TASK_APPROVED = 'TASK_APPROVED', 'Task Approved'
    TASK_REJECTED = 'TASK_REJECTED', 'Changes Requested'
    COMMENT_ADDED = 'COMMENT_ADDED', 'Comment Added'
    DUE_DATE_CHANGED = 'DUE_DATE_CHANGED', 'Due Date Changed'

class TaskActivity(models.Model):
    """Activity timeline record for tasks."""
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='activities')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    activity_type = models.CharField(max_length=40, choices=ActivityType.choices)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} {self.activity_type} on #{self.task_id}"

class TaskComment(models.Model):
    """Comments on a task."""
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Comment by {self.user.username} on #{self.task_id}"

class TaskAttachment(models.Model):
    """File attachments on tasks."""
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='attachments')
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    file = models.FileField(upload_to='attachments/%Y/%m/')
    file_name = models.CharField(max_length=255, blank=True)
    file_size = models.PositiveIntegerField(default=0, help_text="Size in bytes")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if self.file and not self.file_name:
            self.file_name = self.file.name.split('/')[-1]
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.file_name} (#{self.task_id})"
