from django.urls import path
from . import views

app_name = 'approvals'

urlpatterns = [
    path('', views.pending_list_view, name='pending_list'),
]
