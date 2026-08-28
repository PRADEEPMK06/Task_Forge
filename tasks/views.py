from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.utils import timezone
from datetime import datetime
from tasks.models import Task, TaskPriority, TaskStatus, TaskActivity, ActivityType, TaskComment
from accounts.models import User
from organizations.models import Organization
from approvals.models import TaskApproval, ApprovalType, ApprovalStatus
from notifications.models import Notification, NotificationType

@login_required
def dashboard_view(request):
    user = request.user
    org = user.organization

    # Tasks assigned to user or assigned by user
    assigned_to_me = Task.objects.filter(assigned_to=user)
    assigned_by_me = Task.objects.filter(assigned_by=user)
    all_org_tasks = Task.objects.filter(organization=org) if org else Task.objects.all()

    # Metrics
    total_tasks = all_org_tasks.count()
    completed_tasks = all_org_tasks.filter(status=TaskStatus.COMPLETED).count()
    in_progress_tasks = all_org_tasks.filter(status=TaskStatus.IN_PROGRESS).count()
    pending_approval_tasks = all_org_tasks.filter(status__in=[TaskStatus.SUBMITTED, TaskStatus.PENDING_APPROVAL]).count()

    # Direct subordinates
    subordinates = user.subordinates.filter(is_active=True)

    # Recent tasks
    recent_tasks = all_org_tasks.select_related('assigned_to', 'assigned_by').order_by('-created_at')[:8]

    # Pending approvals for current user
    pending_reviews = TaskApproval.objects.filter(
        reviewer=user,
        status=ApprovalStatus.PENDING
    ).select_related('task', 'submitted_by')[:5]

    context = {
        'title': 'Enterprise Dashboard',
        'org': org,
        'total_tasks': total_tasks,
        'completed_tasks': completed_tasks,
        'in_progress_tasks': in_progress_tasks,
        'pending_approval_tasks': pending_approval_tasks,
        'subordinates': subordinates,
        'recent_tasks': recent_tasks,
        'assigned_to_me_count': assigned_to_me.count(),
        'assigned_by_me_count': assigned_by_me.count(),
        'pending_reviews': pending_reviews,
    }
    return render(request, 'tasks/dashboard.html', context)

@login_required
def task_list_view(request):
    user = request.user
    org = user.organization
    tasks = Task.objects.filter(organization=org).select_related('assigned_to', 'assigned_by').order_by('-created_at') if org else Task.objects.select_related('assigned_to', 'assigned_by').all()

    status_filter = request.GET.get('status')
    if status_filter:
        tasks = tasks.filter(status=status_filter)

    priority_filter = request.GET.get('priority')
    if priority_filter:
        tasks = tasks.filter(priority=priority_filter)

    return render(request, 'tasks/task_list.html', {
        'title': 'All Tasks',
        'tasks': tasks,
        'status_choices': TaskStatus.choices,
        'priority_choices': TaskPriority.choices,
        'current_status': status_filter,
        'current_priority': priority_filter,
    })

@login_required
def create_task_view(request):
    user = request.user
    org = user.organization

    # Policy Enforcement: User must have at least one subordinate OR be an executive/admin
    can_create = user.can_create_tasks
    subordinates = list(user.subordinates.filter(is_active=True).order_by('first_name', 'last_name'))
    
    # Other organization members for cross-level / peer delegation
    sub_ids = [s.id for s in subordinates]
    other_members = list(User.objects.filter(is_active=True).exclude(id=user.id).exclude(id__in=sub_ids).order_by('id'))
    
    # Approving parent hierarchy chain for the current user
    parent_approvers = user.get_parent_approvers()

    if request.method == 'POST':
        if not can_create:
            messages.error(request, "Permission Denied: Enterprise policy requires having at least one subordinate to create and assign tasks.")
            return redirect('tasks:dashboard')

        title = request.POST.get('title', '').strip()
        description = request.POST.get('description', '').strip()
        assigned_to_id = request.POST.get('assigned_to')
        priority = request.POST.get('priority', TaskPriority.MEDIUM)
        due_date_str = request.POST.get('due_date', '').strip()

        if not title:
            messages.error(request, "Task title is required.")
            return render(request, 'tasks/create_task.html', {
                'can_create': can_create,
                'subordinates': subordinates,
                'other_members': other_members,
                'parent_approvers': parent_approvers,
                'priority_choices': TaskPriority.choices,
            })

        if not assigned_to_id:
            messages.error(request, "Please select an assignee for this task.")
            return render(request, 'tasks/create_task.html', {
                'can_create': can_create,
                'subordinates': subordinates,
                'other_members': other_members,
                'parent_approvers': parent_approvers,
                'priority_choices': TaskPriority.choices,
            })

        try:
            assigned_to = User.objects.get(id=assigned_to_id)
        except User.DoesNotExist:
            messages.error(request, "Selected assignee does not exist.")
            return redirect('tasks:create_task')

        due_date = None
        if due_date_str:
            try:
                due_date = datetime.strptime(due_date_str, '%Y-%m-%d').date()
            except ValueError:
                due_date = None

        # Check if direct subordinate vs cross-level assignment
        is_direct_subordinate = (assigned_to.manager_id == user.id)

        if is_direct_subordinate:
            # Direct Delegation -> Instantly active
            task = Task.objects.create(
                organization=org or assigned_to.organization,
                title=title,
                description=description,
                assigned_by=user,
                assigned_to=assigned_to,
                priority=priority,
                due_date=due_date,
                status=TaskStatus.ASSIGNED,
                is_cross_level=False,
                progress=0
            )
            
            TaskActivity.objects.create(
                task=task,
                user=user,
                activity_type=ActivityType.TASK_CREATED,
                message=f"Task created by {user.display_name} and assigned directly to subordinate {assigned_to.display_name}."
            )
            
            Notification.objects.create(
                recipient=assigned_to,
                notification_type=NotificationType.TASK_ASSIGNED,
                title="New Task Assigned",
                message=f"{user.display_name} assigned you the task: '{title}'",
                task=task
            )
            
            messages.success(request, f"Task '{title}' successfully created and assigned to {assigned_to.display_name} (Direct Subordinate)!")
            return redirect('tasks:task_detail', task_id=task.id)

        else:
            # Cross-level / Parent-level / Peer Delegation
            # Requires multi-tier approvals from parent chain: e.g. L2 parent and L1 grandparent
            if parent_approvers:
                task = Task.objects.create(
                    organization=org or assigned_to.organization,
                    title=title,
                    description=description,
                    assigned_by=user,
                    assigned_to=assigned_to,
                    priority=priority,
                    due_date=due_date,
                    status=TaskStatus.PENDING_APPROVAL,
                    is_cross_level=True,
                    progress=0
                )
                
                approver_names = [f"Tier {idx+1}: {p.display_name} ({p.level_label})" for idx, p in enumerate(parent_approvers)]
                
                TaskActivity.objects.create(
                    task=task,
                    user=user,
                    activity_type=ActivityType.TASK_CREATED,
                    message=f"Cross-level task created for {assigned_to.display_name} ({assigned_to.level_label}). Submitted for approval to: {', '.join(approver_names)}."
                )

                # Create multi-tier TaskApproval records
                for tier, parent in enumerate(parent_approvers, start=1):
                    TaskApproval.objects.create(
                        task=task,
                        approval_type=ApprovalType.CROSS_LEVEL_DELEGATION,
                        approval_tier=tier,
                        reviewer=parent,
                        submitted_by=user,
                        status=ApprovalStatus.PENDING
                    )
                    Notification.objects.create(
                        recipient=parent,
                        notification_type=NotificationType.TASK_SUBMITTED,
                        title=f"Cross-Level Task Delegation Approval Required (Tier {tier})",
                        message=f"{user.display_name} ({user.level_label}) requested assigning task '{title}' to {assigned_to.display_name} ({assigned_to.level_label}). Your approval is required.",
                        task=task
                    )

                names_str = " & ".join([p.display_name for p in parent_approvers])
                messages.success(
                    request,
                    f"Cross-level task created! Request submitted for multi-tier parent approval to {names_str}. "
                    f"Once approved, the task will be formally assigned to {assigned_to.display_name}."
                )
                return redirect('tasks:task_detail', task_id=task.id)

            else:
                # Level 1 Executive / Top Admin has global authority -> Instant assignment
                task = Task.objects.create(
                    organization=org or assigned_to.organization,
                    title=title,
                    description=description,
                    assigned_by=user,
                    assigned_to=assigned_to,
                    priority=priority,
                    due_date=due_date,
                    status=TaskStatus.ASSIGNED,
                    is_cross_level=True,
                    progress=0
                )
                
                TaskActivity.objects.create(
                    task=task,
                    user=user,
                    activity_type=ActivityType.TASK_CREATED,
                    message=f"Executive cross-organization task created by {user.display_name} for {assigned_to.display_name}."
                )
                
                Notification.objects.create(
                    recipient=assigned_to,
                    notification_type=NotificationType.TASK_ASSIGNED,
                    title="Executive Task Assigned",
                    message=f"{user.display_name} assigned you the task: '{title}'",
                    task=task
                )
                
                messages.success(request, f"Executive task '{title}' created and assigned to {assigned_to.display_name}!")
                return redirect('tasks:task_detail', task_id=task.id)

    return render(request, 'tasks/create_task.html', {
        'title': 'Create & Delegate Task',
        'can_create': can_create,
        'subordinates': subordinates,
        'other_members': other_members,
        'parent_approvers': parent_approvers,
        'priority_choices': TaskPriority.choices,
    })

@login_required
def task_detail_view(request, task_id):
    user = request.user
    org = user.organization
    task = get_object_or_404(Task, id=task_id)

    # Approvals for this task
    approvals = task.approvals.select_related('reviewer', 'submitted_by').order_by('approval_tier', 'created_at')
    
    # Activity timeline
    activities = task.activities.select_related('user').order_by('-created_at')
    
    # Comments
    comments = task.comments.select_related('user').order_by('created_at')

    # Permissions
    is_assignee = (task.assigned_to_id == user.id)
    is_assigner = (task.assigned_by_id == user.id)
    is_reviewer = approvals.filter(reviewer=user, status=ApprovalStatus.PENDING).exists()

    return render(request, 'tasks/task_detail.html', {
        'title': f'Task #{task.id}: {task.title}',
        'task': task,
        'approvals': approvals,
        'activities': activities,
        'comments': comments,
        'is_assignee': is_assignee,
        'is_assigner': is_assigner,
        'is_reviewer': is_reviewer,
    })

@login_required
def update_task_progress_view(request, task_id):
    if request.method != 'POST':
        return redirect('tasks:task_detail', task_id=task_id)
        
    user = request.user
    task = get_object_or_404(Task, id=task_id)

    # Only assignee or assigner or admin can update progress
    if task.assigned_to_id != user.id and task.assigned_by_id != user.id and not user.is_superuser:
        messages.error(request, "Permission Denied: You cannot update progress for this task.")
        return redirect('tasks:task_detail', task_id=task_id)

    progress_raw = request.POST.get('progress', '0')
    submit_for_review = request.POST.get('submit_for_review') == 'true'
    note = request.POST.get('note', '').strip()

    try:
        progress = max(0, min(100, int(progress_raw)))
    except ValueError:
        progress = task.progress

    old_progress = task.progress
    task.progress = progress

    if submit_for_review or progress == 100:
        task.status = TaskStatus.SUBMITTED
        task.save()
        
        # Create completion approval for assigner
        TaskApproval.objects.create(
            task=task,
            approval_type=ApprovalType.TASK_COMPLETION,
            reviewer=task.assigned_by,
            submitted_by=user,
            status=ApprovalStatus.PENDING
        )
        
        TaskActivity.objects.create(
            task=task,
            user=user,
            activity_type=ActivityType.TASK_SUBMITTED,
            message=f"{user.display_name} updated progress to {progress}% and submitted task for supervisor sign-off." + (f" Note: {note}" if note else "")
        )
        
        Notification.objects.create(
            recipient=task.assigned_by,
            notification_type=NotificationType.TASK_SUBMITTED,
            title="Task Completed & Submitted for Review",
            message=f"{user.display_name} submitted task '{task.title}' for completion review.",
            task=task
        )
        messages.success(request, f"Progress updated to {progress}%. Task submitted to {task.assigned_by.display_name} for completion review!")
    else:
        if progress > 0 and task.status == TaskStatus.ASSIGNED:
            task.status = TaskStatus.IN_PROGRESS
        task.save()

        TaskActivity.objects.create(
            task=task,
            user=user,
            activity_type=ActivityType.PROGRESS_UPDATED,
            message=f"{user.display_name} updated progress from {old_progress}% to {progress}%." + (f" Note: {note}" if note else "")
        )
        messages.success(request, f"Task progress updated to {progress}%.")

    return redirect('tasks:task_detail', task_id=task.id)

@login_required
def add_task_comment_view(request, task_id):
    if request.method != 'POST':
        return redirect('tasks:task_detail', task_id=task_id)
        
    user = request.user
    task = get_object_or_404(Task, id=task_id)
    comment_text = request.POST.get('comment', '').strip()

    if comment_text:
        TaskComment.objects.create(
            task=task,
            user=user,
            comment=comment_text
        )
        TaskActivity.objects.create(
            task=task,
            user=user,
            activity_type=ActivityType.COMMENT_ADDED,
            message=f"{user.display_name} posted a comment on this task."
        )
        # Notify counterpart
        counterpart = task.assigned_by if user == task.assigned_to else task.assigned_to
        if counterpart:
            Notification.objects.create(
                recipient=counterpart,
                notification_type=NotificationType.COMMENT_ADDED,
                title="New Comment on Task",
                message=f"{user.display_name} commented on '{task.title}': {comment_text[:80]}...",
                task=task
            )
        messages.success(request, "Comment posted successfully.")

    return redirect('tasks:task_detail', task_id=task.id)
