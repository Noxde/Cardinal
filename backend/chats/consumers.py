import json
from channels.generic.websocket import AsyncWebsocketConsumer
from rest_framework_simplejwt.authentication  import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from asgiref.sync import sync_to_async
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from userauth.tokens import createToken
from .models import Message

class ChatConsumer(AsyncWebsocketConsumer,JWTAuthentication):
    async def connect(self):
        headers = self.scope['headers']
        self.user_model =  get_user_model()
        i = 0
        while i<len(headers): #Finds the jwt access token in the headers
            if headers[i][0] == b'sec-websocket-protocol':
                jwttoken = headers[i][1].decode() 
            i+=1

        try:
            validatedtoken = self.get_validated_token(jwttoken)
            self.user = await sync_to_async(self.get_user)(validatedtoken)
            self.room_name = self.user.username
            self.room_group_name = self.room_name

            # Join room group
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            await self.accept()
        except InvalidToken:
            self.room_name = createToken(7)
            self.room_group_name = self.room_name
        
    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        text_data_json["type"] = "chat_message"
        text_data_json["sender"] = self.user.id

        try:
            # Saves the message in the database
            receiver = await database_sync_to_async(self.user_model.objects.get)(username=text_data_json["receiver"])
            await database_sync_to_async(Message.objects.create)(content=text_data_json["content"],sender=self.user,receiver=receiver)

            # Send message to room group
            await self.channel_layer.group_send(
                receiver.username, text_data_json
            )
        except self.user_model.DoesNotExist:
            pass

    # Receive message from room group
    async def chat_message(self, event):

        # Send message to WebSocket
        await self.send(text_data=json.dumps(event))