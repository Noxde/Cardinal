from django.urls import path
from . import views



urlpatterns = [
    path('createpost/', views.createpost.as_view(), name='createpost'),
    path('delete/', views.delete.as_view(), name='delete'),
    path('likes/<str:context>/<str:action>/<int:id>/', views.likes.as_view(), name='likes'),

    
]