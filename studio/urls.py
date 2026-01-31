# FILE: studio/urls.py
# SYNC: 2026-01-31 10:15 AM
# REASON: Establishing the independent 'studio' route for Konva development sandbox.
# -------------------------------------------------------------------------------

from django.urls import path
from . import views

app_name = 'studio'

urlpatterns = [
    # Maps http://localhost:8000/studio/
    path('', views.studio_sandbox, name='studio_sandbox'),
]