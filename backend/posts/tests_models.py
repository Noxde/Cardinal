from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import Post,Comment
from datetime import timezone,datetime,timedelta

class PostTestCase(TestCase):
    def setUp(self): 
        self.user1 = get_user_model().objects.create(username="Charles",email="Charles@cardinal.com",password="Charles123")
        self.user2 = get_user_model().objects.create(username="John",email="John@cardinal.com",password="John123")
        self.user3 = get_user_model().objects.create(username="Thomas",email="Thomas@cardinal.com",password="Thomas123")
        self.post1 = Post.objects.create(user=self.user1,content="Hello World!!")
        self.post2 = Post.objects.create(user=self.user2,content="Bye World!!")
        self.post3 = Post.objects.create(user=self.user3,content="I Love Ice Cream!!")

    def test_post_user(self):
        """Posts have the correct user."""
        self.assertEqual(self.user1,self.post1.user)
        self.assertEqual(self.user2,self.post2.user)

    def test_post_creation_time(self):
        """Posts have the correct creation_time."""
        post = Post.objects.create(user=self.user1,content="Hi!!")
        self.assertAlmostEqual(post.creation_time,datetime.now(tz=timezone.utc),delta=timedelta(milliseconds=100))


    def test_post_content(self):
        """Posts have the correct content."""
        self.assertEqual(self.post1.content,"Hello World!!")
        self.assertEqual(self.post3.content,"I Love Ice Cream!!")

    def test_post_likes(self):
        """Posts have the correct likes."""
        self.post1.likes.add(self.user1)
        self.post1.likes.add(self.user2)
        self.post1.likes.add(self.user3)
        self.assertEqual(self.post1.likes.count(),3)
        self.post1.likes.remove(self.user2)
        self.post1.likes.remove(self.user3)
        self.assertEqual(self.post1.likes.count(),1)
        like_user = self.post1.likes.get(post=self.post1)
        self.assertEqual(like_user,self.user1)

    def test_get_top_comment(self):
        """get_top_comment() returns the correct comment."""
        comment1 = Comment.objects.create(user=self.user1,post=self.post1,content="Comment number 1.")
        self.assertEqual(Post.get_top_comment(self.post1),comment1)
        comment2 = Comment.objects.create(user=self.user2,post=self.post1,content="Comment number 2.")
        self.assertEqual(Post.get_top_comment(self.post1),comment2)
        comment1.likes.add(self.user1)
        self.assertEqual(Post.get_top_comment(self.post1),comment1)
        comment2.likes.add(self.user1)
        comment2.likes.add(self.user2)
        self.assertEqual(Post.get_top_comment(self.post1),comment2)
        comment1.likes.add(self.user2)
        comment2.likes.remove(self.user2)
        self.assertEqual(Post.get_top_comment(self.post1),comment1)

    def test_get_comment_amount(self):
        """get_comment_amount() returns the correct amount."""
        self.assertEqual(Post.get_comment_amount(self.post1),0)
        comment1 = Comment.objects.create(user=self.user1,post=self.post1,content="Comment number 1.")
        self.assertEqual(Post.get_comment_amount(self.post1),1)
        Comment.objects.create(user=self.user2,post=self.post1,content="Comment number 2.")
        Comment.objects.create(user=self.user3,post=self.post1,content="Comment number 3.")
        self.assertEqual(Post.get_comment_amount(self.post1),3)
        comment1.delete()
        self.assertEqual(Post.get_comment_amount(self.post1),2)