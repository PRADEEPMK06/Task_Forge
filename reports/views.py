from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.db.models import Count
from tasks.models import Task, TaskStatus, TaskPriority

@login_required
def report_dashboard_view(request):
    user = request.user
    org = user.organization

    tasks_qs = Task.objects.filter(organization=org) if org else Task.objects.all()

    total_tasks = tasks_qs.count()
    completed_tasks = tasks_qs.filter(status=TaskStatus.COMPLETED).count()
    in_progress_tasks = tasks_qs.filter(status=TaskStatus.IN_PROGRESS).count()
    submitted_tasks = tasks_qs.filter(status__in=[TaskStatus.SUBMITTED, TaskStatus.UNDER_REVIEW]).count()
    
    completion_rate = round((completed_tasks / total_tasks * 100)) if total_tasks > 0 else 0

    priority_counts = {
        'LOW': tasks_qs.filter(priority=TaskPriority.LOW).count(),
        'MEDIUM': tasks_qs.filter(priority=TaskPriority.MEDIUM).count(),
        'HIGH': tasks_qs.filter(priority=TaskPriority.HIGH).count(),
        'CRITICAL': tasks_qs.filter(priority=TaskPriority.CRITICAL).count(),
    }

    return render(request, 'reports/dashboard.html', {
        'title': 'Enterprise Analytics & Performance',
        'total_tasks': total_tasks,
        'completed_tasks': completed_tasks,
        'in_progress_tasks': in_progress_tasks,
        'submitted_tasks': submitted_tasks,
        'completion_rate': completion_rate,
        'priority_counts': priority_counts,
    })

