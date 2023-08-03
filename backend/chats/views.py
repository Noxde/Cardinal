from django.http import JsonResponse
from .models import Message
from .serializers import MessageSerializer
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
            qs = qs.exclude(sender=F("receiver"))[(page-1)*limit:page*limit]

        except self.user_model.DoesNotExist:
            return JsonResponse({'status':f'Username "{chat}" does not match any user.'},status=400)

        if not qs:
            return JsonResponse({'status':f'Failed to match any message on page={page} of chat="{chat}" with limit={limit}.'},status=404) 
        
        for message in qs:
            response.append(MessageSerializer(message).data)
        
        return JsonResponse(response,safe=False,status=200)