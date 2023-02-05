from django.db import models
from django.contrib.auth.models import AbstractUser, UserManager
import os
from .tokens import createToken

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

    def __setattr__(self, attr,value): 
        if (attr == 'profileimg' or attr == 'banner') and (value and not isinstance(value,str)):#If the attribute to set is an image
            try:
                value.name = f'{createToken(15)}.{value.name.split(".")[1]}'  #Changes its name to an alphanumeric token
            
            except Exception as e:
                print('Exception on userauth.models.User.__setattr__: ',e)
        object.__setattr__(self, attr, value)   
        

    def getfields():          #Returns all the names of the fields in User
 
        return [field.name for field in User._meta.get_fields()]
        

