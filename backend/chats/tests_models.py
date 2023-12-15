from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import Chat

class ChatTestCase(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.user1 = get_user_model().objects.create(username="Mike",email="mike@cardinal.com",password="Mike123")
        cls.user2 = get_user_model().objects.create(username="George",email="george@cardinal.com",password="George123")
        cls.chat = Chat.objects.create(user_one=cls.user1,user_two=cls.user2) 
    
    def test_Chat_user_one(self):
        """Chat.user_one is OK."""
        self.assertEqual(self.user1,self.chat.user_one)

    def test_Chat_user_two(self):
        """Chat.user_two is OK."""
        self.assertEqual(self.user2,self.chat.user_two)
