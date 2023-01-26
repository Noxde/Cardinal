from django.db import models
from django.contrib.auth.models import AbstractUser, UserManager


class User(AbstractUser):     #Custom user model
    email = models.EmailField(unique=True)
    about = models.TextField(max_length=1000,blank=True)
    region = models.CharField(max_length=50,blank=True)
    lang = models.CharField(max_length=50,blank=True)
    birth_date = models.DateField(null=True, blank=True)
    date_joined = models.DateField(null=True, blank=True)
    last_login = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=False)

    

    def getfields():          #Returns the fields that can be modified with setattr()
        fields=['username','email','first_name','last_name','about','region','lang','birth_date']
        # return [field.name for field in User._meta.get_fields()]
        return fields
    
