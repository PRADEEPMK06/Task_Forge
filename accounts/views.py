from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login as auth_login, logout as auth_logout, authenticate
from django.contrib import messages
from django.utils.http import url_has_allowed_host_and_scheme
from django.views.decorators.csrf import csrf_exempt
from accounts.models import User

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login as auth_login, logout as auth_logout, authenticate
from django.contrib import messages
from django.utils.http import url_has_allowed_host_and_scheme
from django.views.decorators.csrf import csrf_exempt
from accounts.models import User
from organizations.models import Organization

@csrf_exempt
def login_view(request):
    # Support quick login via user_id or email query parameter
    user_id = request.GET.get('user_id')
    quick_email = request.GET.get('email')
    quick_demo = request.GET.get('demo') or request.GET.get('quick')
    
    if user_id:
        target = User.objects.filter(id=user_id, is_active=True).first()
        if target:
            auth_login(request, target)
            request.session.modified = True
            messages.success(request, f'Signed in as {target.display_name} ({target.level_label})')
            return redirect('tasks:dashboard')

    if quick_email:
        target = User.objects.filter(email__iexact=quick_email.strip(), is_active=True).first()
        if target:
            auth_login(request, target)
            request.session.modified = True
            messages.success(request, f'Signed in as {target.display_name} ({target.level_label})')
            return redirect('tasks:dashboard')
    elif quick_demo:
        admin_user = User.objects.filter(is_superuser=True, is_active=True).first() or User.objects.filter(email='admin@gmail.com', is_active=True).first()
        if admin_user:
            auth_login(request, admin_user)
            request.session.modified = True
            messages.success(request, f'Signed in as {admin_user.display_name} ({admin_user.level_label})')
            return redirect('tasks:dashboard')

    if request.user.is_authenticated:
        return redirect('tasks:dashboard')

    users = list(User.objects.filter(is_active=True).select_related('manager', 'organization').order_by('id'))
    org = Organization.objects.first()

    if request.method == 'POST':
        # Check if login was triggered via a user selection or manual login form
        selected_user_id = request.POST.get('user_id')
        if selected_user_id:
            target = User.objects.filter(id=selected_user_id, is_active=True).first()
            if target:
                auth_login(request, target)
                request.session.modified = True
                messages.success(request, f'Active Session: {target.display_name} ({target.level_label})')
                return redirect('tasks:dashboard')

        email = request.POST.get('email', '').strip()
        password = request.POST.get('password', '')
        next_url = request.POST.get('next') or request.GET.get('next')

        user = authenticate(request, username=email, password=password)
        if user is None:
            try:
                candidate = User.objects.filter(email__iexact=email).first() or User.objects.filter(username__iexact=email).first()
                if candidate and (candidate.check_password(password) or password == 'Admin@123'):
                    user = candidate
            except Exception:
                user = None

        if user is not None:
            if not user.is_active:
                messages.error(request, 'This account is currently disabled.')
                return render(request, 'accounts/prototype_auth.html', {
                    'users': users,
                    'managers': users,
                    'default_password': 'Admin@123',
                })

            auth_login(request, user)
            request.session.modified = True
            messages.success(request, f'Welcome, {user.display_name}!')

            if next_url and url_has_allowed_host_and_scheme(next_url, allowed_hosts={request.get_host()}):
                return redirect(next_url)
            return redirect('tasks:dashboard')
        else:
            messages.error(request, 'Invalid credentials. You can click on any role card directly below to enter.')

    return render(request, 'accounts/prototype_auth.html', {
        'users': users,
        'managers': users,
        'default_password': 'Admin@123',
        'next': request.GET.get('next', ''),
    })

@csrf_exempt
def register_view(request):
    """
    Prototype Registration View:
    Collects full name, email (mail), password, role, and hierarchical manager.
    Displays all registered accounts with their mail and password,
    and moves to that role's dashboard upon registration or clicking.
    """
    users = list(User.objects.filter(is_active=True).select_related('manager', 'organization').order_by('id'))
    org = Organization.objects.first()

    if request.method == 'POST':
        name = request.POST.get('name', '').strip()
        email = request.POST.get('email', '').strip()
        password = request.POST.get('password', '').strip() or 'Admin@123'
        role = request.POST.get('role', '').strip() or 'Team Member'
        manager_id = request.POST.get('manager_id')

        if not email:
            messages.error(request, 'Please provide an email address.')
            return render(request, 'accounts/prototype_auth.html', {
                'users': users,
                'managers': users,
                'default_password': 'Admin@123',
                'active_tab': 'register',
            })

        manager = User.objects.filter(id=manager_id).first() if manager_id else None

        # Check if user already exists
        existing_user = User.objects.filter(email__iexact=email).first()
        if existing_user:
            existing_user.first_name = name or existing_user.first_name
            existing_user.role = role
            if manager:
                existing_user.manager = manager
            existing_user.set_password(password)
            existing_user.save()
            user = existing_user
            messages.success(request, f'Account updated for {user.display_name} ({user.role}). Password: {password}')
        else:
            username = email.split('@')[0]
            # Ensure unique username
            base_username = username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}_{counter}"
                counter += 1

            user = User.objects.create(
                username=username,
                email=email,
                first_name=name or username.capitalize(),
                role=role,
                manager=manager,
                organization=org,
                is_active=True,
            )
            user.set_password(password)
            user.save()
            messages.success(request, f'New role "{role}" registered for {user.display_name}! Email: {email} | Password: {password}')

        # Direct login to the dashboard of that role
        auth_login(request, user)
        request.session.modified = True
        return redirect('tasks:dashboard')

    return render(request, 'accounts/prototype_auth.html', {
        'users': users,
        'managers': users,
        'default_password': 'Admin@123',
        'active_tab': 'register',
    })


def switch_user_view(request, user_id):
    """Switch active logged in user for multi-role hierarchy testing."""
    target_user = get_object_or_404(User, id=user_id)
    auth_login(request, target_user)
    request.session.modified = True
    messages.success(request, f'Switched active session to {target_user.get_full_name() or target_user.username} ({target_user.level_label})')
    next_url = request.GET.get('next') or request.META.get('HTTP_REFERER') or '/tasks/'
    return redirect(next_url)

@csrf_exempt
def logout_view(request):
    auth_logout(request)
    messages.success(request, 'You have been signed out successfully.')
    return redirect('accounts:login')

def team_list_view(request):
    if not request.user.is_authenticated:
        return redirect('accounts:login')
    user = request.user
    org = user.organization
    
    subordinates = user.subordinates.filter(is_active=True).select_related('manager')
    all_members = User.objects.filter(organization=org).select_related('manager') if org else User.objects.all().select_related('manager')
    
    return render(request, 'accounts/team.html', {
        'title': 'Direct Team & Organization Directory',
        'user': user,
        'org': org,
        'subordinates': subordinates,
        'all_members': all_members,
    })

def profile_view(request):
    if not request.user.is_authenticated:
        return redirect('accounts:login')
    user = request.user
    org = user.organization
    
    return render(request, 'accounts/profile.html', {
        'title': 'User Profile & Identity',
        'user': user,
        'org': org,
        'manager': user.manager,
        'subordinates_count': user.subordinates.count(),
    })
