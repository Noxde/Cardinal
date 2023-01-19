from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):     #Custom user model
    about = models.TextField(max_length=1000,blank=True)
    region = models.CharField(max_length=50,blank=True)
    lang = models.CharField(max_length=50,blank=True)
    birth_date = models.DateField(null=True, blank=True)
    date_joined = models.DateField(null=True, blank=True)
    last_login = models.DateField(null=True, blank=True)

    def getfields():          #Returns the name of the fields as strings in a list
        return [field.name for field in User._meta.get_fields()]
    
