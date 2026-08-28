import secrets
import string
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.translation import gettext_lazy as _

def generate_user_code():
    """Generate a unique, hard-to-guess user code like TF-USR-8F29K4."""
    chars = string.ascii_uppercase + string.digits
    random_part = ''.join(secrets.choice(chars) for _ in range(6))
    return f"TF-USR-{random_part}"

class UserManager(BaseUserManager):
    """Custom user manager for email & username handling."""
    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError(_('The Email field must be set'))
        if not username:
            raise ValueError(_('The Username field must be set'))
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))

        return self.create_user(email, username, password, **extra_fields)

class User(AbstractUser):
    """
    Custom User model for TaskForge.
    Supports self-referencing hierarchical manager relationship and organization isolation.
    """
    email = models.EmailField(_('email address'), unique=True, db_index=True)
    phone = models.CharField(max_length=30, blank=True, default='')
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    role = models.CharField(max_length=100, default='Team Member', help_text="Job title or role description")
    user_code = models.CharField(
        max_length=32,
        unique=True,
        db_index=True,
        default=generate_user_code,
        editable=False,
        help_text="Unique user code for hierarchy joining"
    )
    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='members',
        db_index=True
    )
    manager = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='subordinates',
        db_index=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    class Meta:
        ordering = ['first_name', 'last_name']
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        name = self.get_full_name() or self.username
        return f"{name} ({self.user_code})"

    @property
    def display_name(self):
        return self.get_full_name() or self.username

    @property
    def hierarchy_level(self):
        """Calculate organizational depth: 1 = Top Level / Executive, 2 = Director / VP, 3 = Lead / Manager, 4 = Specialist / Contributor."""
        lvl = 1
        curr = self
        visited = set()
        while curr.manager is not None and curr.id not in visited:
            visited.add(curr.id)
            lvl += 1
            curr = curr.manager
        return lvl

    @property
    def level_label(self):
        lvl = self.hierarchy_level
        if lvl == 1:
            return "Level 1 (Executive)"
        elif lvl == 2:
            return "Level 2 (Director / VP)"
        elif lvl == 3:
            return "Level 3 (Team Lead)"
        elif lvl == 4:
            return "Level 4 (Engineer / Contributor)"
        return f"Level {lvl}"

    @property
    def can_create_tasks(self):
        """
        Policy: Users can add/create tasks when there is at least one subordinate under them,
        or if they are an executive/administrator.
        """
        if self.is_superuser or self.is_staff or self.hierarchy_level == 1:
            return True
        return self.subordinates.filter(is_active=True).exists()

    def get_parent_approvers(self):
        """
        Returns ascending chain of managers (e.g. L2 parent, L1 grandparent)
        who must approve cross-level task delegations.
        """
        parents = []
        curr = self.manager
        visited = set([self.id])
        while curr and curr.id not in visited:
            visited.add(curr.id)
            parents.append(curr)
            curr = curr.manager
        return parents
