# FILE: studio/urls.py
# SYNC: 2026-02-15 03:00 PM
# REASON: Added word validation API endpoint for CHALLENGE button

from django.urls import path
from . import views

app_name = 'studio'

urlpatterns = [
    path('', views.studio_sandbox, name='studio_sandbox'),
    path('api/validate-word/', views.validate_word, name='validate_word'),
]