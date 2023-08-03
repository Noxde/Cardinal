from django.urls import path
from . import views



urlpatterns = [
    path('getchat/<str:chat>/<int:page>/<int:limit>/',view=views.getchat.as_view(),name='getchat'),
]