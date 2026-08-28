from django.urls import path
from . import views

app_name = 'hierarchy'

urlpatterns = [
    path('', views.hierarchy_view, name='hierarchy_view'),
]
