"""
Management command to seed the database with default admin and initial enterprise demo data.
"""
from django.core.management.base import BaseCommand
from accounts.models import User
from organizations.models import Organization
from tasks.models import Task, TaskPriority, TaskStatus
from django.utils import timezone
from datetime import timedelta

class Command(BaseCommand):
    help = 'Seed database with default admin (admin@gmail.com / Admin@123) and sample enterprise structure'

    def handle(self, *args, **options):
        # 1. Ensure Organization exists
        org, created = Organization.objects.get_or_create(
            name='TaskForge Enterprise HQ',
            defaults={
                'description': 'Main Enterprise Workspace & Corporate Hierarchy',
                'is_active': True,
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created organization: {org.name} ({org.organization_code})'))
        else:
            self.stdout.write(f'Organization already exists: {org.name}')

        # 2. Ensure Default Admin User exists
        admin_email = 'admin@gmail.com'
        admin_password = 'Admin@123'

        admin_user, admin_created = User.objects.get_or_create(
            email=admin_email,
            defaults={
                'username': 'admin',
                'first_name': 'Enterprise',
                'last_name': 'Admin',
                'role': 'Enterprise Administrator',
                'is_staff': True,
                'is_superuser': True,
                'is_active': True,
                'organization': org,
            }
        )

        # Set and ensure password
        admin_user.set_password(admin_password)
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.is_active = True
        admin_user.organization = org
        admin_user.save()

        if admin_created:
            org.created_by = admin_user
            org.save()
            self.stdout.write(self.style.SUCCESS(f'Created default superuser: {admin_email} / {admin_password}'))
        else:
            self.stdout.write(self.style.SUCCESS(f'Updated default superuser: {admin_email} with password {admin_password}'))

        # 3. Create Sample Subordinate Managers & Members
        subordinates_data = [
            {
                'email': 'sarah.connor@taskforge.io',
                'username': 'sarah_c',
                'first_name': 'Sarah',
                'last_name': 'Connor',
                'role': 'Director of Engineering',
                'password': 'Password@123',
            },
            {
                'email': 'marcus.vance@taskforge.io',
                'username': 'marcus_v',
                'first_name': 'Marcus',
                'last_name': 'Vance',
                'role': 'Head of Product & Design',
                'password': 'Password@123',
            },
            {
                'email': 'elena.rostova@taskforge.io',
                'username': 'elena_r',
                'first_name': 'Elena',
                'last_name': 'Rostova',
                'role': 'Operations Lead',
                'password': 'Password@123',
            }
        ]

        created_subordinates = []
        for sub in subordinates_data:
            user, u_created = User.objects.get_or_create(
                email=sub['email'],
                defaults={
                    'username': sub['username'],
                    'first_name': sub['first_name'],
                    'last_name': sub['last_name'],
                    'role': sub['role'],
                    'is_staff': False,
                    'is_superuser': False,
                    'is_active': True,
                    'organization': org,
                    'manager': admin_user,
                }
            )
            user.set_password(sub['password'])
            user.manager = admin_user
            user.organization = org
            user.save()
            created_subordinates.append(user)

        # 4. Create Sample Tasks
        if Task.objects.count() == 0 and created_subordinates:
            now = timezone.now()
            sample_tasks = [
                {
                    'title': 'Q3 Enterprise Architecture Modernization',
                    'description': 'Finalize the high-availability migration plan and conduct security audit across core microservices.',
                    'assigned_by': admin_user,
                    'assigned_to': created_subordinates[0],
                    'priority': TaskPriority.CRITICAL,
                    'status': TaskStatus.IN_PROGRESS,
                    'progress': 65,
                    'due_date': now + timedelta(days=5),
                },
                {
                    'title': 'Design System & Accessibility (WCAG 2.1 AA) Review',
                    'description': 'Audit primary dashboard components and navigation palette for high contrast and keyboard navigation.',
                    'assigned_by': admin_user,
                    'assigned_to': created_subordinates[1],
                    'priority': TaskPriority.HIGH,
                    'status': TaskStatus.ASSIGNED,
                    'progress': 20,
                    'due_date': now + timedelta(days=8),
                },
                {
                    'title': 'SOC2 Compliance & Vendor Risk Assessment Report',
                    'description': 'Aggregate annual access logs and verify employee 2FA enforcement across departmental tools.',
                    'assigned_by': admin_user,
                    'assigned_to': created_subordinates[2],
                    'priority': TaskPriority.MEDIUM,
                    'status': TaskStatus.APPROVED,
                    'progress': 100,
                    'due_date': now + timedelta(days=2),
                }
            ]

            for t in sample_tasks:
                Task.objects.create(
                    organization=org,
                    title=t['title'],
                    description=t['description'],
                    assigned_by=t['assigned_by'],
                    assigned_to=t['assigned_to'],
                    priority=t['priority'],
                    status=t['status'],
                    progress=t['progress'],
                    due_date=t['due_date'],
                )
            self.stdout.write(self.style.SUCCESS(f'Created {len(sample_tasks)} initial tasks.'))

        self.stdout.write(self.style.SUCCESS('Successfully seeded database!'))
