from django.http import JsonResponse
from .models import Message, Chat
from .serializers import MessageSerializer, ChatSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.db.models import Q,F
from django.contrib.auth import get_user_model



class getchat(APIView): #Returns the messages from a chat
    permission_classes = [IsAuthenticated]

    def get(self, request, chat, page, limit):
        loguser = request.user
        self.user_model = get_user_model()
        response = []

        try:
            chatuser = self.user_model.objects.get(username=chat)
            qs = Message.objects.filter(Q(sender=loguser) | Q(sender=chatuser))
            qs = qs.filter(Q(receiver=loguser) | Q(receiver=chatuser)).order_by('id')
            #Exclude hidden messages
            qs = qs.exclude(Q(sender=loguser) & Q(show_to_sender=False))
            qs = qs.exclude(Q(receiver=loguser) & Q(show_to_receiver=False))
            #Slice
            qs = qs.exclude(sender=F("receiver"))[(page-1)*limit:page*limit]

        except self.user_model.DoesNotExist:
            return JsonResponse({'status':f'Username "{chat}" does not match any user.'},status=400)

        if not qs:
            return JsonResponse({'status':f'Failed to match any message on page={page} of chat="{chat}" with limit={limit}.'},status=404) 
        
        for message in qs:
            response.append(MessageSerializer(message).data)
        
        return JsonResponse(response,safe=False,status=200)
    
class createchat(APIView): #Creates a Chat object
    permission_classes = [IsAuthenticated]

    def post(self, request, username_two):
        user_one = request.user
        self.user_model = get_user_model()

        try:
            user_two = self.user_model.objects.get(username=username_two)
            #Avoid creating a chat with the same user_one and user_two
            if (user_one==user_two):
                return JsonResponse({'status':'Chat creation avoided: "username_two" cannot be the same as the authenticated user.'},status=400)
            chat = Chat.objects.filter(Q(user_one=user_one) | Q(user_one=user_two))
            chat = Chat.objects.exclude(user_one=F('user_two'))
            chat = chat.get(Q(user_two=user_one) | Q(user_two=user_two))
            #If the chat already exist but its hidden from user_one then make it visible
            was_hidden = False
            if (chat.user_one==user_one) and (chat.show_to_user_one==False):
                chat.show_to_user_one = True
                was_hidden = True
            elif (chat.user_two==user_one) and (chat.show_to_user_two==False):
                chat.show_to_user_two = True
                was_hidden = True
            if was_hidden:
                chat.save()
                return JsonResponse(ChatSerializer(chat,context={'loguser':user_one}).data,status=200)

        except (self.user_model.DoesNotExist, Chat.DoesNotExist, Chat.MultipleObjectsReturned) as error:
            if isinstance(error, self.user_model.DoesNotExist):
                return JsonResponse({'status':f'Username "{username_two}" does not match any user.'},status=400)
            
            elif isinstance(error, Chat.DoesNotExist):
                chat = Chat.objects.create(user_one=user_one,user_two=user_two)
                return JsonResponse(ChatSerializer(chat,context={'loguser':user_one}).data,status=201)
            
            elif isinstance(error, Chat.MultipleObjectsReturned):
                return JsonResponse({'status':'MultipleObjectsReturned, Chat creation avoided.'},status=400)
            
        return JsonResponse({'status':'Chat already exists.'},status=400)
    
class getopenchats(APIView): #Gets all the open chats of an user
    permission_classes = [IsAuthenticated]

    def get(self, request):
        loguser = request.user

        chats = Chat.objects.filter(Q(user_one=loguser) | Q(user_two=loguser))
        #Exclude hidden chats
        chats = chats.exclude(Q(user_one=loguser) & Q(show_to_user_one=False))
        chats = chats.exclude(Q(user_two=loguser) & Q(show_to_user_two=False))

        if not chats:
            return JsonResponse({'status':f'User "{loguser.username}" does not have any open chat.'},status=404)
        
        chats_serialized = []
        for chat in chats:
            chats_serialized.append(ChatSerializer(chat,context={'loguser':loguser}).data)
        response = [chats_serialized.pop(0)]
        for chat in chats_serialized:
            i=0
            last_message = chat['last_message']
            if last_message==False:
                Chat.objects.get(id=chat['id']).delete()
                continue
            while i<len(response)  and last_message['id']<response[i]['last_message']['id']:
                i+=1
            response.insert(i,chat)

        return JsonResponse(response,safe=False,status=200)
    
class deletemessage(APIView): #Deletes a message
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        messageid = request.data.get('messageid',False)

        if messageid:
            try:
                message = Message.objects.get(sender=user,id=messageid)
                message.delete()
                return JsonResponse({'status':'Message Deleted Successfully.'}, status=200)
            except Message.DoesNotExist:
                return JsonResponse({'status':f'Id "{messageid}" does not match any message sent by user "{user.username}".'}, status=404)
        else:
            return JsonResponse({'status':'Missing Parameter: messageid.'}, status=400)

class deletechat(APIView): #Deletes a chat
    permission_classes = [IsAuthenticated]

    def post(self, request):
        loguser = request.user
        chatid = request.data.get('chatid',False)

        if chatid:
            try:
                chat = Chat.objects.get(Q(id=chatid),Q(user_one=loguser) | Q(user_two=loguser))
                #Hide the chat from the loguser and get the second user of the chat
                if chat.user_one==loguser:
                    chat.show_to_user_one = False
                    chatuser = chat.user_two
                else:
                    chat.show_to_user_two = False
                    chatuser = chat.user_one
                
                #Delete the chat if its hiden from both users
                if (chat.show_to_user_one==False) and (chat.show_to_user_two==False):
                    chat.delete()
                else:
                    chat.save()
                
                #Get all messages of the chat
                qs = Message.objects.filter(Q(sender=loguser) | Q(sender=chatuser))
                qs = qs.filter(Q(receiver=loguser) | Q(receiver=chatuser))
                #Exclude messages with equal sender and receiver
                qs = qs.exclude(sender=F("receiver"))
                #Hide messages from loguser. Delete messages that are hidden for both users
                for instance in qs:
                    if instance.sender==loguser:
                        instance.show_to_sender = False
                    else:
                        instance.show_to_receiver = False
                    
                    if (instance.show_to_sender==False) and (instance.show_to_receiver==False):
                        instance.delete()
                    else:
                        instance.save()
                
                return JsonResponse({'status':'Chat Deleted Successfully.'}, status=200)
            except Chat.DoesNotExist:
                return JsonResponse({'status':f'User "{loguser.username}" does not have any chat with id "{chatid}".'}, status=404)
        else:
            return JsonResponse({'status':'Missing Parameter: "chatid".'}, status=400)