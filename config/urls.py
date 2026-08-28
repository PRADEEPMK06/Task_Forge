"""
URL configuration for TaskForge project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Root redirects to dashboard (or login if unauthenticated)
    path('', RedirectView.as_view(pattern_name='tasks:dashboard', permanent=False), name='home'),

    # Template Web Views
    path('accounts/', include(('accounts.urls', 'accounts'), namespace='accounts')),
    path('organizations/', include(('organizations.urls', 'organizations'), namespace='organizations')),
    path('hierarchy/', include(('hierarchy.urls', 'hierarchy'), namespace='hierarchy')),
    path('tasks/', include(('tasks.urls', 'tasks'), namespace='tasks')),
    path('approvals/', include(('approvals.urls', 'approvals'), namespace='approvals')),
    path('reports/', include(('reports.urls', 'reports'), namespace='reports')),
    path('notifications/', include(('notifications.urls', 'notifications'), namespace='notifications')),

    # REST API endpoints
    path('api/auth/', include(('accounts.api_urls', 'accounts_api'), namespace='api_accounts')),
    path('api/organizations/', include(('organizations.api_urls', 'organizations_api'), namespace='api_organizations')),
    path('api/hierarchy/', include(('hierarchy.api_urls', 'hierarchy_api'), namespace='api_hierarchy')),
    path('api/tasks/', include(('tasks.api_urls', 'tasks_api'), namespace='api_tasks')),
    path('api/approvals/', include(('approvals.api_urls', 'approvals_api'), namespace='api_approvals')),
    path('api/reports/', include(('reports.api_urls', 'reports_api'), namespace='api_reports')),
    path('api/notifications/', include(('notifications.api_urls', 'notifications_api'), namespace='api_notifications')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
