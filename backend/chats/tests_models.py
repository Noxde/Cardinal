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

    def test_Chat_show_to_user_one(self):
        """Chat.show_to_user_one is OK."""
        self.assertTrue(self.chat.show_to_user_one)
        self.chat.show_to_user_one = False 
        self.chat.save()
        self.assertFalse(Chat.objects.get(id=self.chat.id).show_to_user_one)

    def test_Chat_show_to_user_two(self):
        """Chat.show_to_user_two is OK."""
        self.assertTrue(self.chat.show_to_user_two)
        self.chat.show_to_user_two = False 
        self.chat.save()
        self.assertFalse(Chat.objects.get(id=self.chat.id).show_to_user_two)

    def test_Chat_delete_ser(self):
        """Chat.delete_user() is OK."""
        user1 = get_user_model().objects.create(username="James",email="James@cardinal.com")
        user2 = get_user_model().objects.create(username="Charles",email="Charles@cardinal.com")
        chat = Chat.objects.create(user_one=user1,user_two=user2)
        self.assertTrue(chat.show_to_user_one)
        self.assertTrue(chat.show_to_user_two)
        user1.delete()
        chat = Chat.objects.get(id=chat.id)
        self.assertFalse(chat.show_to_user_one)
        self.assertTrue(chat.show_to_user_two)
        user2.delete()
        self.assertFalse(Chat.objects.filter(id=chat.id))


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

    def test_Message_show_to_sender(self):
        """Message.show_to_sender is OK."""
        self.assertTrue(self.message.show_to_sender)
        self.message.show_to_sender = False 
        self.message.save()
        self.assertFalse(Message.objects.get(id=self.message.id).show_to_sender)

    def test_Message_show_to_receiver(self):
        """Message.show_to_receiver is OK."""
        self.assertTrue(self.message.show_to_receiver)
        self.message.show_to_receiver = False 
        self.message.save()
        self.assertFalse(Message.objects.get(id=self.message.id).show_to_receiver)