import json
from channels.generic.websocket import AsyncWebsocketConsumer
from rest_framework_simplejwt.authentication  import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from asgiref.sync import sync_to_async
from django.contrib.auth import get_user_model


class ChatConsumer(AsyncWebsocketConsumer,JWTAuthentication):
    async def connect(self):
        headers = self.scope['headers']
        self.user_model =  get_user_model()
        i = 0
        while i<len(headers): #Finds the jwt access token in the headers
            if headers[i][0] == b'sec-websocket-protocol':
                jwttoken = headers[i][1].decode() 
            i+=1

        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = "chat_%s" % self.room_name

        try:
            validatedtoken = self.get_validated_token(jwttoken)
            user = await sync_to_async(self.get_user)(validatedtoken)

            # Join room group
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            await self.accept()
        except InvalidToken:
            pass
        
    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name, {"type": "chat_message", "message": message}
        )

    # Receive message from room group
    async def chat_message(self, event):
        message = event["message"]

        # Send message to WebSocket
        await self.send(text_data=json.dumps({"message": message}))