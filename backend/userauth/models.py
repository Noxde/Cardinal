from django.db import models
from django.contrib.auth.models import AbstractUser, UserManager
import os, datetime
from .tokens import createToken
from django.utils import timezone



class User(AbstractUser):     #Custom user model
    profileimg = models.ImageField(upload_to='user/',blank=True)
    banner = models.ImageField(upload_to='user/',blank=True)
    email = models.EmailField(unique=True)
    about = models.TextField(max_length=1000,blank=True)
    region = models.CharField(max_length=50,blank=True)
    lang = models.CharField(max_length=50,blank=True)
    birth_date = models.DateField(null=True, blank=True)
    date_joined = models.DateField(null=True, blank=True)
    last_login = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=False)
    follows = models.ManyToManyField('self',symmetrical=False,blank=True)
    show_validation = models.BooleanField(default=1)

    def __setattr__(self, attr,value): 
        if (attr == 'profileimg' or attr == 'banner') and (value and not isinstance(value,str)):#If the attribute to set is an image
            try:
                value.name = f'{createToken(15)}.{value.name.split(".")[1]}'  #Changes its name to an alphanumeric token
            
            except Exception as e:
                print('Exception on userauth.models.User.__setattr__: ',e)
        object.__setattr__(self, attr, value)   
        

    def getfields():          #Returns all the names of the fields in User
 
        return [field.name for field in User._meta.get_fields()]


class Emails(models.Model): #Keeps a log of all the emails sent to avoid spamming
    EMAILCONFIRMATION = 'EC'
    PASSWORDRESET = 'PR'
    ACCOUNTDELETE = 'AD'
    
    emailsubjects = [
    (EMAILCONFIRMATION, 'EmailConfirmation'),
    (PASSWORDRESET, 'PasswordReset'),
    ]
    user = models.ForeignKey(User , on_delete=models.CASCADE)
    time = models.DateTimeField(auto_now_add=True)
    subject = models.CharField(
        max_length=2,
        choices=emailsubjects,
    )

    def last_hour():
        return timezone.now() - timezone.timedelta(hours=1)

    def last_day():
        return timezone.now() - timezone.timedelta(days=1)

    def reset(user):
        Emails.objects.filter(time__lt=Emails.last_day()).delete()
    
    def spam(user,subject):
        HOURLY_LIMIT = 3
        DAILY_LIMIT = 10

        Emails.reset(user)

        last_hour_emails = len(Emails.objects.filter(user=user,subject=subject,time__gt=Emails.last_hour()))
        last_day_emails = len(Emails.objects.filter(user=user,subject=subject,time__gt=Emails.last_day()))

        if last_hour_emails>HOURLY_LIMIT or last_day_emails>DAILY_LIMIT:
            return True
        else:
            return False
        
