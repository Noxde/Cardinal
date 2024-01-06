from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import Chat, Message
from datetime import datetime,timezone,timedelta

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


class MessageTestCase(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.user1 = get_user_model().objects.create(username="Tyler",email="tyler@cardinal.com",password="Tyler123")
        cls.user2 = get_user_model().objects.create(username="Larry",email="larry@cardinal.com",password="Larry123")
        cls.message = Message.objects.create(content="Hello, Larry!!",sender=cls.user1,receiver=cls.user2) 
    
    def test_Message_content(self):
        """Message content is correct."""
        self.assertEqual(self.message.content,"Hello, Larry!!")

    def test_Message_sender(self):
        """Message sender is correct."""
        self.assertEqual(self.message.sender,self.user1)
    
    def test_Message_receiver(self):
        """Message receiver is correct."""
        self.assertEqual(self.message.receiver,self.user2)

    def test_Message_creation_time(self):
        """Message creation_time is correct."""
        message = Message.objects.create(content="I am speed.",sender=self.user1,receiver=self.user2)
        self.assertAlmostEqual(message.creation_time,datetime.now(tz=timezone.utc),delta=timedelta(milliseconds=100))