from django.db import models
from django.contrib.auth import get_user_model


class Post(models.Model): #Model for user posts

    user = models.ForeignKey(get_user_model() , on_delete=models.CASCADE)
    creation_time = models.DateTimeField(auto_now_add=True)
    content = models.TextField(max_length=200)
    likes = models.ManyToManyField(get_user_model(),symmetrical=False,blank=True,related_name='likes')

class Files (models.Model): #Model for posts files
    post = models.ForeignKey(Post,on_delete=models.CASCADE)
    file = models.FileField(upload_to='post/',blank=True)
    