from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('logout/', views.logout_view, name='logout'),
    path('switch/<int:user_id>/', views.switch_user_view, name='switch_user'),
    path('team/', views.team_list_view, name='team_list'),
    path('profile/', views.profile_view, name='profile'),
]
