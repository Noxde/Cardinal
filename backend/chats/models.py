from django.db import models
from django.contrib.auth import get_user_model

class Chat(models.Model): #Model for open chats, avoids searching in Message model

    user_one = models.ForeignKey(get_user_model(), on_delete=models.DO_NOTHING, related_name="user_one", db_constraint=False)
    user_two = models.ForeignKey(get_user_model(), on_delete=models.DO_NOTHING, related_name="user_two", db_constraint=False)
    show_to_user_one = models.BooleanField(default=True)
    show_to_user_two = models.BooleanField(default=True)

class Message(models.Model): #Model for chat messages

    content = models.TextField(max_length=300)
    sender = models.ForeignKey(get_user_model(), on_delete=models.DO_NOTHING, related_name="sender", db_constraint=False)
    receiver = models.ForeignKey(get_user_model(), on_delete=models.DO_NOTHING, related_name="receiver", db_constraint=False)
    creation_time = models.DateTimeField(auto_now_add=True)
    show_to_sender = models.BooleanField(default=True)
    show_to_receiver = models.BooleanField(default=True)