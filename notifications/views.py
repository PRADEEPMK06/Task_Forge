from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from notifications.models import Notification

@login_required
def notification_list_view(request):
    user = request.user

    # If POST to mark all as read
    if request.method == 'POST':
        action = request.POST.get('action')
        if action == 'mark_all_read':
            Notification.objects.filter(recipient=user, is_read=False).update(is_read=True)
            messages.success(request, 'All notifications marked as read.')
            return redirect('notifications:notification_list')

    notifications = Notification.objects.filter(recipient=user).order_by('-created_at')

    return render(request, 'notifications/list.html', {
        'title': 'Notifications & Activity Feed',
        'notifications': notifications,
        'unread_count': notifications.filter(is_read=False).count(),
    })

