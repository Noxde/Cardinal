from django.urls import path
from . import views



urlpatterns = [
    path('createpost/', views.createpost.as_view(), name='createpost'),
    path('createcomment/', views.createcomment.as_view(), name='createcomment'),
    path('delete/', views.delete.as_view(), name='delete'),
    path('likes/<str:context>/<str:action>/<int:id>/', views.likes.as_view(), name='likes'),
    path('getpost/<str:context>/<str:username>/<str:refresh>/',view=views.getpost.as_view(),name='getpost')

    
]