from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from ..models import Chat, Message

class ViewsTestCase(TestCase):
    def setUp(self):
        self.user1 = get_user_model().objects.create(username="James",email='James@cardinal.com')
        self.user1.is_active = True
        self.user1.set_password("James123")
        self.user1.save()
    
        self.user2 = get_user_model().objects.create(username="Thomas",email='Thomas@cardinal.com')
        self.user2.is_active = True
        self.user2.set_password("Thomas123")
        self.user2.save()

    def test_getchat(self):
        """Getchat view is OK."""

        #Create messages
        for i in range(10):
            if i % 2:
                sender=self.user1
                receiver=self.user2
            else:
                sender=self.user2
                receiver=self.user1
            Message.objects.create(content=f"Message {i+1}",
                                   sender=sender,
                                   receiver=receiver
                                   )
        c = Client()
        login = c.post("/login/",{"id":self.user1,"password":"James123"})
        c = Client(HTTP_AUTHORIZATION=f'Bearer {login.json()["access"]}')

        #Check if the messages in the response are OK
        for page in [1,2]:
            response = c.get(f"/getchat/{self.user2.id}/{page}/5/")
            for i, message in enumerate(response.json()):
                self.assertEqual(message["content"],f"Message {message['id']}")
                if message['id'] % 2:
                    self.assertEqual(message["sender"],2)
                    self.assertEqual(message["receiver"],1)
                else:
                    self.assertEqual(message["sender"],1)
                    self.assertEqual(message["receiver"],2)

        # Check error responses
        self.assertEqual(c.get(f"/getchat/{self.user2.id}/1/0/").json()["status"],
                         'Argument "limit" must be greater than 0.')
        
        self.assertEqual(c.get(f"/getchat/{self.user2.id}/0/1/").json()["status"],
                    'Argument "page" must be greater than 0.')

        self.assertEqual(c.get(f"/getchat/{self.user2.id}/20/100/").json()["status"],
                    f'Failed to match any message on page=20 of chat="{self.user2.id}" with limit=100.')
        
        self.user2.delete()
        #Check if the messages in the response are OK
        for page in [1,2]:
            response = c.get(f"/getchat/2/{page}/5/")
            for i, message in enumerate(response.json()):
                self.assertEqual(message["content"],f"Message {message['id']}")
                if message['id'] % 2:
                    self.assertEqual(message["sender"],2)
                    self.assertEqual(message["receiver"],1)
                else:
                    self.assertEqual(message["sender"],1)
                    self.assertEqual(message["receiver"],2)
        
        self.user1.delete()
        self.assertFalse(Message.objects.all())

    def test_createchat(self):
        """Createchat view is OK."""
        c = Client()
        login = c.post("/login/",{"id":self.user1,"password":"James123"})
        c = Client(HTTP_AUTHORIZATION=f'Bearer {login.json()["access"]}')

        #Check error responses
        self.assertEqual(c.post(f"/createchat/test/").json()["status"],
        'Username "test" does not match any user.')

        self.assertEqual(c.post(f"/createchat/James/").json()["status"],
        'Chat creation avoided: "username_two" cannot be the same as the authenticated user.')

        Chat.objects.create(user_one=self.user1, user_two=self.user2)

        self.assertEqual(c.post(f"/createchat/Thomas/").json()["status"],
        'Chat already exists.')

        Chat.objects.create(user_one=self.user1, user_two=self.user2)

        self.assertEqual(c.post(f"/createchat/Thomas/").json()["status"],
        'MultipleObjectsReturned, Chat creation avoided.')

        #Check normal response
        Chat.objects.all().delete()
        response =  c.post(f"/createchat/Thomas/")
        self.assertEqual(response.json()["id"],3)
        self.assertEqual(response.json()["chat_user"]["id"],2)

    def test_getopenchats(self):
        """Getopenchats view is OK."""
        c = Client()
        login = c.post("/login/",{"id":self.user1,"password":"James123"})
        c = Client(HTTP_AUTHORIZATION=f'Bearer {login.json()["access"]}')

        #Check error responses
        self.assertEqual(c.get(f"/getopenchats/").json()["status"],
        'User "James" does not have any open chat.')

        Chat.objects.create(user_one=self.user1,user_two=self.user2)
        self.assertFalse(c.get(f"/getopenchats/").json())
       
       #Check normal response
        chat = Chat.objects.create(user_one=self.user1,user_two=self.user2)
        Message.objects.create(content="Do not delete chat",
                               sender=self.user1,
                               receiver=self.user2)
        response = c.get(f"/getopenchats/").json()
        self.assertEqual(response[0]["id"],2)
        self.assertEqual(response[0]["chat_user"]["id"],2)
        self.assertEqual(response[0]["last_message"]["content"],
                         "Do not delete chat")
        self.assertEqual(len(response),1)

        chat.show_to_user_one = False
        chat.save()
        self.assertEqual(c.get(f"/getopenchats/").json()["status"],
        'User "James" does not have any open chat.')
