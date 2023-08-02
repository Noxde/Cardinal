from django.db import models
from django.contrib.auth import get_user_model

class Message(models.Model): #Model for chat messages

    content = models.TextField(max_length=300)
    sender = models.ForeignKey(get_user_model(), on_delete=models.CASCADE,related_name="sender")
    receiver = models.ForeignKey(get_user_model(), on_delete=models.CASCADE,related_name="receiver")
    creation_time = models.DateTimeField(auto_now_add=True)