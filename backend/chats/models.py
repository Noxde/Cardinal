from django.db import models
from django.contrib.auth import get_user_model

class Chat(models.Model): #Model for open chats, avoids searching in Message model

    user_one = models.ForeignKey(get_user_model(), on_delete=models.DO_NOTHING, related_name="user_one", db_constraint=False)
    user_two = models.ForeignKey(get_user_model(), on_delete=models.DO_NOTHING, related_name="user_two", db_constraint=False)
    show_to_user_one = models.BooleanField(default=True)
    show_to_user_two = models.BooleanField(default=True)

    def delete_user(user): #Hides all chats of an user to itself
        chats = Chat.objects.filter(models.Q(user_one_id=user) | models.Q(user_two_id=user))

        for chat in chats:
            if chat.user_one_id == user.id: 
                chat.show_to_user_one = False
            else: 
                chat.show_to_user_two = False
            
            if (chat.show_to_user_one==False) and (chat.show_to_user_two==False):
                chat.delete()
            else:
                chat.save()      

class Message(models.Model): #Model for chat messages

    content = models.TextField(max_length=300)
    sender = models.ForeignKey(get_user_model(), on_delete=models.DO_NOTHING, related_name="sender", db_constraint=False)
    receiver = models.ForeignKey(get_user_model(), on_delete=models.DO_NOTHING, related_name="receiver", db_constraint=False)
    creation_time = models.DateTimeField(auto_now_add=True)
    show_to_sender = models.BooleanField(default=True)
    show_to_receiver = models.BooleanField(default=True)

    def delete_user(user): #Hides all messages of an user to itself
        messages = Message.objects.filter(models.Q(sender_id=user.id) | models.Q(receiver_id=user.id))

        for message in messages:
            if message.sender_id == user.id: 
                message.show_to_sender = False
            else: 
                message.show_to_receiver = False
            
            if (message.show_to_sender==False) and (message.show_to_receiver==False):
                message.delete()
            else:
                message.save()      