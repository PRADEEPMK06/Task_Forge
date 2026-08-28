from django.urls import path
from . import views

app_name = 'tasks'

urlpatterns = [
    path('', views.dashboard_view, name='dashboard'),
    path('tasks/', views.task_list_view, name='task_list'),
    path('create/', views.create_task_view, name='create_task'),
    path('<int:task_id>/', views.task_detail_view, name='task_detail'),
    path('<int:task_id>/progress/', views.update_task_progress_view, name='update_progress'),
    path('<int:task_id>/comment/', views.add_task_comment_view, name='add_comment'),
]
