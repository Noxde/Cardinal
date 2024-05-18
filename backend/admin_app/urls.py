from django.urls import path
from . import views

urlpatterns = [
    path('mediafiles/cleanup/', views.CleanupMediaFiles.as_view(), name='CleanupMediaFiles'),
]