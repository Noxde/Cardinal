from django.urls import path
from . import views



urlpatterns = [
    path('getchat/<int:chat>/<int:page>/<int:limit>/',view=views.getchat.as_view(),name='getchat'),
    path('createchat/<str:username_two>/',view=views.createchat.as_view(),name='createchat'),
    path('getopenchats/',view=views.getopenchats.as_view(),name='getopenchats'),
    path('deletemessage/',view=views.deletemessage.as_view(),name='deletemessage'),
    path('deletechat/',view=views.deletechat.as_view(),name='deletechat'),
]