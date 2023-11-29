from rest_framework import serializers
from backend.settings import NGINX_DOMAIN,MEDIA_URL 
from .models import Message, Chat
from django.db.models import Q, F


class MessageSerializer(serializers.ModelSerializer): #Serializer for the Message model

    class Meta:
        model = Message
        fields = ['id',
                  'content',
                  'sender',
                  'receiver',
                  'creation_time',
                 ]
        
class ChatSerializer(serializers.ModelSerializer): #Serializer for open chats
    chat_user = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()

    def get_chat_user(self, chat):
        loguser = self.context.get("loguser")
        if loguser==chat.user_one:
            chat_user=chat.user_two
        else:
            chat_user=chat.user_one

        profileimgurl = NGINX_DOMAIN+MEDIA_URL+chat_user.profileimg.name if chat_user.profileimg else '' 
        
        return {'id':chat_user.id,
                'username':chat_user.username,
                'profileimg':profileimgurl,
               }

    def get_last_message(self, chat):
        try:
            last_message = Message.objects.filter(Q(sender=chat.user_one) | Q(sender=chat.user_two))
            last_message = last_message.filter(Q(receiver=chat.user_one) | Q(receiver=chat.user_two))
            last_message = last_message.exclude(sender=F("receiver")).order_by('-id')[0]
        except IndexError:
            return False
        return MessageSerializer(last_message).data

    class Meta:
        model = Chat
        fields = ['id',
                  'chat_user',
                  'last_message',
                  ]

