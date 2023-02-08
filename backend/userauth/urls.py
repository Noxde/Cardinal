from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView


urlpatterns = [
    path('login/token/refresh/', TokenRefreshView.as_view(), name='login_token_refresh'),
    path('getuserinfo/', views.getuserinfo.as_view(), name='getuserinfo'),
    path('getpublicprofile/', views.getpublicprofile.as_view(), name='getpublicprofile'),
    path('moduserinfo/', views.moduserinfo.as_view(), name='moduserinfo'),
    path('follows/',views.follows.as_view(), name='follows'),
    path('register/', views.register, name='register'),
    path('login/',views.login,name='login'),
    path('csrf/', views.csrf),
    path('ping/', views.ping),
    path('sendconfirmationemail/', views.SendConfirmationEmail,name='SendConfirmationEmail'),
    path('ConfirmEmail/<uidb64>/<token>', views.ConfirmEmail, name='ConfirmEmail'),

    

]