from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from accounts.models import User
from organizations.models import Organization

@login_required
def organization_settings_view(request):
    user = request.user
    org = user.organization

    members_count = User.objects.filter(organization=org).count() if org else 1

    return render(request, 'organizations/settings.html', {
        'title': 'Enterprise Organization Settings',
        'org': org,
        'members_count': members_count,
        'user': user,
    })

