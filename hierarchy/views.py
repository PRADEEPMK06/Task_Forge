from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from accounts.models import User

@login_required
def hierarchy_view(request):
    user = request.user
    org = user.organization

    # Root users (users with no manager or top-level superusers)
    roots = User.objects.filter(organization=org, manager__isnull=True, is_active=True).prefetch_related('subordinates') if org else User.objects.filter(manager__isnull=True, is_active=True).prefetch_related('subordinates')

    # Subordinates of current user
    my_subordinates = user.subordinates.filter(is_active=True).prefetch_related('subordinates')

    return render(request, 'hierarchy/hierarchy.html', {
        'title': 'Organizational Hierarchy',
        'org': org,
        'roots': roots,
        'my_subordinates': my_subordinates,
        'current_user': user,
    })

