from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.utils import timezone
from tasks.models import Task, TaskStatus, TaskActivity, ActivityType
from approvals.models import TaskApproval, ApprovalType, ApprovalStatus
from notifications.models import Notification, NotificationType

@login_required
def pending_list_view(request):
    user = request.user
    org = user.organization

    # If POST action (Approve or Reject / Request changes)
    if request.method == 'POST':
        approval_id = request.POST.get('approval_id')
        task_id = request.POST.get('task_id')
        action = request.POST.get('action')
        comments = request.POST.get('comments', '').strip()

        # Find approval record for this reviewer
        approval = None
        if approval_id:
            approval = get_object_or_404(TaskApproval, id=approval_id, reviewer=user)
            task = approval.task
        elif task_id:
            task = get_object_or_404(Task, id=task_id)
            approval = TaskApproval.objects.filter(task=task, reviewer=user, status=ApprovalStatus.PENDING).first()
            if not approval and (task.assigned_by_id == user.id or user.is_superuser):
                # Fallback completion approval
                approval = TaskApproval.objects.create(
                    task=task,
                    approval_type=ApprovalType.TASK_COMPLETION,
                    reviewer=user,
                    submitted_by=task.assigned_to,
                    status=ApprovalStatus.PENDING
                )
        else:
            messages.error(request, "Invalid approval action target.")
            return redirect('approvals:pending_list')

        if not approval:
            messages.error(request, "No pending approval found for your account on this task.")
            return redirect('approvals:pending_list')

        if action == 'approve':
            approval.status = ApprovalStatus.APPROVED
            approval.reviewed_at = timezone.now()
            approval.comments = comments
            approval.save()

            if approval.approval_type == ApprovalType.CROSS_LEVEL_DELEGATION:
                # Check if all required parent approvals for this task are completed
                remaining_pending = task.approvals.filter(
                    approval_type=ApprovalType.CROSS_LEVEL_DELEGATION,
                    status=ApprovalStatus.PENDING
                ).exists()

                if not remaining_pending:
                    # All parent tiers approved!
                    task.status = TaskStatus.ASSIGNED
                    task.save()

                    TaskActivity.objects.create(
                        task=task,
                        user=user,
                        activity_type=ActivityType.TASK_APPROVED,
                        message=f"Cross-level delegation Tier {approval.approval_tier} approved by {user.display_name}. All parent approvals complete! Task is now officially assigned to {task.assigned_to.display_name}."
                    )

                    Notification.objects.create(
                        recipient=task.assigned_by,
                        notification_type=NotificationType.TASK_APPROVED,
                        title="Cross-Level Delegation Approved!",
                        message=f"Your cross-level task delegation for '{task.title}' was approved by all parent authorities. Assigned to {task.assigned_to.display_name}.",
                        task=task
                    )

                    Notification.objects.create(
                        recipient=task.assigned_to,
                        notification_type=NotificationType.TASK_ASSIGNED,
                        title="New Task Assigned (Cross-Level)",
                        message=f"{task.assigned_by.display_name} assigned you the task: '{task.title}' following parent leadership approval.",
                        task=task
                    )

                    messages.success(request, f"Delegation approved! All parent tiers satisfied — task is now assigned to {task.assigned_to.display_name}.")
                else:
                    # Waiting for remaining parent tier(s)
                    TaskActivity.objects.create(
                        task=task,
                        user=user,
                        activity_type=ActivityType.TASK_APPROVED,
                        message=f"Cross-level delegation Tier {approval.approval_tier} approved by {user.display_name}. Waiting for remaining parent tier approval(s)."
                    )

                    Notification.objects.create(
                        recipient=task.assigned_by,
                        notification_type=NotificationType.TASK_APPROVED,
                        title=f"Tier {approval.approval_tier} Delegation Approved",
                        message=f"{user.display_name} approved Tier {approval.approval_tier} of your task delegation for '{task.title}'. Awaiting higher parent tiers.",
                        task=task
                    )

                    messages.success(request, f"Tier {approval.approval_tier} approval recorded. Awaiting higher parent tier reviews.")

            elif approval.approval_type == ApprovalType.TASK_COMPLETION:
                task.status = TaskStatus.COMPLETED
                task.progress = 100
                task.completed_at = timezone.now()
                task.save()

                TaskActivity.objects.create(
                    task=task,
                    user=user,
                    activity_type=ActivityType.TASK_APPROVED,
                    message=f"Task completion verified and approved by supervisor {user.display_name}." + (f" Note: {comments}" if comments else "")
                )

                Notification.objects.create(
                    recipient=task.assigned_to,
                    notification_type=NotificationType.TASK_APPROVED,
                    title="Task Completion Approved!",
                    message=f"{user.display_name} verified and approved your completion of '{task.title}'.",
                    task=task
                )

                messages.success(request, f"Task #{task.id} verified and marked as COMPLETED!")

        elif action in ['reject', 'changes_requested']:
            approval.status = ApprovalStatus.REJECTED if approval.approval_type == ApprovalType.CROSS_LEVEL_DELEGATION else ApprovalStatus.CHANGES_REQUESTED
            approval.reviewed_at = timezone.now()
            approval.comments = comments
            approval.save()

            if approval.approval_type == ApprovalType.CROSS_LEVEL_DELEGATION:
                task.status = TaskStatus.REJECTED
                task.save()

                TaskActivity.objects.create(
                    task=task,
                    user=user,
                    activity_type=ActivityType.TASK_REJECTED,
                    message=f"Cross-level delegation rejected by {user.display_name} ({user.level_label})." + (f" Reason: {comments}" if comments else "")
                )

                Notification.objects.create(
                    recipient=task.assigned_by,
                    notification_type=NotificationType.CHANGES_REQUESTED,
                    title="Cross-Level Delegation Rejected",
                    message=f"{user.display_name} rejected the task delegation for '{task.title}'." + (f" Feedback: {comments}" if comments else ""),
                    task=task
                )

                messages.warning(request, f"Delegation request for task #{task.id} rejected.")

            elif approval.approval_type == ApprovalType.TASK_COMPLETION:
                task.status = TaskStatus.CHANGES_REQUESTED
                task.save()

                TaskActivity.objects.create(
                    task=task,
                    user=user,
                    activity_type=ActivityType.TASK_REJECTED,
                    message=f"Changes requested on task completion by {user.display_name}." + (f" Feedback: {comments}" if comments else "")
                )

                Notification.objects.create(
                    recipient=task.assigned_to,
                    notification_type=NotificationType.CHANGES_REQUESTED,
                    title="Changes Requested on Task",
                    message=f"{user.display_name} requested modifications on '{task.title}'." + (f" Notes: {comments}" if comments else ""),
                    task=task
                )

                messages.warning(request, f"Changes requested for task #{task.id}.")

        return redirect('approvals:pending_list')

    # Pending approvals assigned to current user
    my_pending_approvals = TaskApproval.objects.filter(
        reviewer=user,
        status=ApprovalStatus.PENDING
    ).select_related('task', 'task__assigned_by', 'task__assigned_to', 'submitted_by').order_by('approval_tier', '-created_at')

    # Recent completed reviews by current user
    my_history = TaskApproval.objects.filter(
        reviewer=user
    ).exclude(status=ApprovalStatus.PENDING).select_related('task', 'task__assigned_by', 'task__assigned_to', 'submitted_by').order_by('-reviewed_at')[:10]

    # Requests submitted by current user awaiting others
    my_submitted_requests = TaskApproval.objects.filter(
        submitted_by=user,
        status=ApprovalStatus.PENDING
    ).select_related('task', 'reviewer', 'task__assigned_to').order_by('-created_at')

    return render(request, 'approvals/pending_list.html', {
        'title': 'Approvals & Multi-Tier Delegation Reviews',
        'my_pending_approvals': my_pending_approvals,
        'my_history': my_history,
        'my_submitted_requests': my_submitted_requests,
    })
