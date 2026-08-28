from django.urls import path
from . import views

app_name = 'organizations'

urlpatterns = [
    path('settings/', views.organization_settings_view, name='organization_settings'),
]
