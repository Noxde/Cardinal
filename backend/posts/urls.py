from django.urls import path
from . import views



urlpatterns = [
    path('createpost/', views.createpost.as_view(), name='createpost'),

    
]