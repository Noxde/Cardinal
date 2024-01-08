from django.db import models
from django.contrib.auth import get_user_model

class Chat(models.Model): #Model for open chats, avoids searching in Message model

    user_one = models.ForeignKey(get_user_model(), on_delete=models.CASCADE,related_name="user_one")
    user_two = models.ForeignKey(get_user_model(), on_delete=models.CASCADE,related_name="user_two")
    show_to_user_one = models.BooleanField(default=True)
    show_to_user_two = models.BooleanField(default=True)

class Message(models.Model): #Model for chat messages

    content = models.TextField(max_length=300)
    sender = models.ForeignKey(get_user_model(), on_delete=models.CASCADE,related_name="sender")
    receiver = models.ForeignKey(get_user_model(), on_delete=models.CASCADE,related_name="receiver")
    creation_time = models.DateTimeField(auto_now_add=True)