from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.files import File
from ..models import Post,Comment,PostFiles,CommentFiles
from backend.settings import MEDIA_ROOT
from datetime import timezone,datetime,timedelta
from os.path import join,isfile
from filecmp import cmp

class PostTestCase(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.user1 = get_user_model().objects.create(username="Charles",email="Charles@cardinal.com",password="Charles123")
        cls.user2 = get_user_model().objects.create(username="John",email="John@cardinal.com",password="John123")
        cls.user3 = get_user_model().objects.create(username="Thomas",email="Thomas@cardinal.com",password="Thomas123")

    def setUp(self): 
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


class CommentTestCase(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.user1 = get_user_model().objects.create(username="James",email="james@cardinal.com",password="James123")
        cls.user2 = get_user_model().objects.create(username="Gunther",email="gunther@cardinal.com",password="Gunther123")
        cls.user3 = get_user_model().objects.create(username="Sebastian",email="sebastian@cardinal.com",password="Sebastian123")

    def setUp(self):
        self.post = Post.objects.create(user=self.user1,content="Hello, James here.")
        self.comment1 = Comment.objects.create(user=self.user1,post=self.post,content="This is my post.")
        self.comment2 = Comment.objects.create(user=self.user2,post=self.post,content="Hello James, i am Gunther.")
        self.comment3 = Comment.objects.create(user=self.user3,post=self.post,content="Nice post.")
    
    def test_comment_user(self):
        """Comments have the right user."""
        self.assertEqual(self.comment1.user,self.user1)
        self.assertEqual(self.comment3.user,self.user3)

    def test_comment_post(self):
        """Comments belong to the right post."""
        self.assertEqual(self.comment1.post,self.post)
        self.assertEqual(self.comment2.post,self.post)

    def test_comment_content(self):
        """Comment have the correct content."""
        self.assertEqual(self.comment2.content,"Hello James, i am Gunther.")
        self.assertEqual(self.comment3.content,"Nice post.")
    
    def test_comment_creation_time(self):
        """Comments have the correct creation time."""
        comment = Comment.objects.create(user=self.user1,post=self.post,content="This is a comment to test creation time.")
        self.assertAlmostEqual(comment.creation_time,datetime.now(tz=timezone.utc),delta=timedelta(milliseconds=100))

    def test_comment_likes(self):
        """Comment likes work properly."""
        self.assertEqual(self.comment1.likes.count(),0)
        self.comment1.likes.add(self.user1)
        self.assertEqual(self.comment1.likes.count(),1)
        self.comment2.likes.add(self.user1)
        self.comment2.likes.add(self.user2)
        self.assertEqual(self.comment2.likes.count(),2)
        self.assertNotIn(self.user3,self.comment2.likes.all())
        self.comment2.likes.remove(self.user2)
        self.assertNotIn(self.user2,self.comment2.likes.all())
        self.assertEqual(self.user1,self.comment2.likes.all()[0])


class PostFilesTestCase(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.test_file_path = join(MEDIA_ROOT,"tests/test_image_1.jpg")
        cls.user = get_user_model().objects.create(username='Kyle',email='kyle@cardinal.com',password='Kyle123')

    def setUp(self):
        self.post = Post.objects.create(user=self.user,content='Hello, my name is Kyle.')
        with open(self.test_file_path,"rb") as file: 
            django_file = File(file,name="test_image_1.jpg")
            self.post_file = PostFiles.objects.create(post=self.post,file=django_file)
            self.file_path = join(MEDIA_ROOT,self.post_file.file.name)
        
    def test_PostFiles_post(self):
        """PostFiles have the correct post."""
        self.assertEqual(self.post_file.post,self.post)
    
    def test_PostFiles_file(self):
        """PostFiles have the correct file."""
        self.assertTrue(cmp(self.file_path,self.test_file_path,shallow=False))

    def test_PostFiles_pre_delete(self):
        """PostFiles are deleted correctly."""
        self.assertTrue(isfile(self.file_path))        
        self.post.delete()
        self.assertFalse(PostFiles.objects.filter(post=self.post))
        self.assertFalse(isfile(self.file_path))        


class CommentFilesTestCase(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.test_file_path = join(MEDIA_ROOT,"tests/test_image_3.jpg")
        cls.user = get_user_model().objects.create(username='Walter',email='walter@cardinal.com',password='Walter123')

    def setUp(self):
        self.post = Post.objects.create(user=self.user,content='Hello, my name is Walter.')
        self.comment = Comment.objects.create(user=self.user,post=self.post,content="This is a comment.")
        with open(self.test_file_path,"rb") as file: 
            django_file = File(file,name="test_image_3.jpg")
            self.comment_file = CommentFiles.objects.create(comment=self.comment,file=django_file)
            self.file_path = join(MEDIA_ROOT,self.comment_file.file.name)
        
    def test_CommentFiles_comment(self):
        """CommentFiles have the correct comment."""
        self.assertEqual(self.comment_file.comment,self.comment)
    
    def test_CommentFiles_file(self):
        """CommentFiles have the correct file."""
        self.assertTrue(cmp(self.file_path,self.test_file_path,shallow=False))

    def test_CommentFiles_pre_delete(self):
        """CommentFiles are deleted correctly."""
        self.assertTrue(isfile(self.file_path))        
        self.comment.delete()
        self.assertFalse(CommentFiles.objects.filter(comment=self.comment))
        self.assertFalse(isfile(self.file_path))  
