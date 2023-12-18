from django.test import TestCase,Client
from django.core.files import File
from .models import User
from posts.models import Post, Comment
from backend.settings import MEDIA_ROOT,PROFILE_PLACEHOLDER_PATH
from os.path import join,isfile
from datetime import date, datetime, timezone, timedelta
from filecmp import cmp

class UserTestCase(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.test_image_name = "test_image_2.jpg"
        cls.test_image_path = join(MEDIA_ROOT,"tests",cls.test_image_name)
        with open(cls.test_image_path,"rb") as test_image:
            test_image = File(test_image,cls.test_image_name)
            cls.user = User.objects.create(username="Carl",
                                            banner=test_image,
                                            email="carl@cardinal.com",
                                            about="Hello my name is Carl.",
                                            region="Argentina",
                                            lang="Spanish",
                                            birth_date=date(year=1990,month=6,day=21),
                                            is_active=1)
            cls.user.set_password("Carl123")
            cls.user.save()

    def test_user_username(self):
        """User.username is OK."""
        self.assertEqual(self.user.username,"Carl")

    def test_user_password(self):
        """User.password is OK."""
        self.assertTrue(self.user.check_password("Carl123"))
    
    def test_user_profileimg(self):
        """User.profileimg is OK."""
        self.assertTrue(cmp(join(MEDIA_ROOT,PROFILE_PLACEHOLDER_PATH),join(MEDIA_ROOT,self.user.profileimg.name)))
    
    def test_user_banner(self):
        """User.banner is OK."""
        self.assertTrue(cmp(self.test_image_path,join(MEDIA_ROOT,self.user.banner.name)))
    
    def test_user_email(self):
        """User.email is OK"""
        self.assertEqual(self.user.email,"carl@cardinal.com")
    
    def test_user_about(self):
        """User.about is OK."""
        self.assertEqual(self.user.about,"Hello my name is Carl.")

    def test_user_region(self):
        """User.region is OK."""
        self.assertEqual(self.user.region,"Argentina")

    def test_user_lang(self):
        """User.lang is OK."""
        self.assertEqual(self.user.lang,"Spanish")

    def test_user_birth_date(self):
        """User.birth_date is OK."""
        self.assertEqual(self.user.birth_date,date(year=1990,month=6,day=21))

    def test_user_date_joined(self):
        """User.date_joined is OK."""
        user = User.objects.create(username="date_user")
        self.assertEqual(user.date_joined,date.today())
    
    def test_user_last_login(self):
        """User.last_login is OK."""
        c = Client()
        response = c.post("/login/",{"id":self.user.username,"password":"Carl123"})
        self.assertTrue(response.status_code,200)
        updated_user = User.objects.get(id=self.user.id)
        self.assertAlmostEqual(updated_user.last_login,datetime.now(timezone.utc),delta=timedelta(milliseconds=100))

    def test_user_is_active(self):
        """User.is_active is OK."""
        self.assertEqual(self.user.is_active,1)

    def test_user_follows(self):
        """User.follows is OK."""
        user1 = User.objects.create(username='User1',email="user1@cardinal.com",password="User1abc")
        user2 = User.objects.create(username='User2',email="user2@cardinal.com",password="User2abc")
        user3 = User.objects.create(username='User3',email="user3@cardinal.com",password="User3abc")
        self.assertEqual(user1.follows.count(),0)
        user1.follows.add(user2)
        user1.follows.add(user3)
        self.assertEqual(user1.follows.count(),2)
        self.assertFalse(User.objects.filter(follows=user1))
        user2.follows.add(user1)
        user3.follows.add(user1)
        self.assertEqual(User.objects.filter(follows=user1).count(),2)

    def test_user_show_validation(self):
        """User.show_validation is OK."""
        self.assertEqual(self.user.show_validation,1)
        c = Client()
        response = c.get(f"/showvalidationpage/{self.user.username}/")
        self.assertEqual(response.status_code,200)
        updated_user = User.objects.get(id=self.user.id)
        self.assertEqual(updated_user.show_validation,0)

    def test_user_last_post(self):
        """User.last_post is OK."""
        c = Client()
        login = c.post("/login/",{"id":self.user.username,"password":"Carl123"})
        self.assertEqual(self.user.last_post,0)
        Post.objects.create(user=self.user,content="This is a post.")
        c2 = Client(HTTP_AUTHORIZATION=f'Bearer {login.json()["access"]}')
        c2.get(f"/getpost/profile/{self.user.username}/True/")
        updated_user = User.objects.get(id=self.user.id)
        self.assertEqual(updated_user.last_post,1)
        

    def test_user_last_comment(self):
        """User.last_comment is OK."""
        c = Client()
        login = c.post("/login/",{"id":self.user.username,"password":"Carl123"})
        self.assertEqual(self.user.last_comment,0)
        post = Post.objects.create(user=self.user,content="This is a post.")
        Comment.objects.create(user=self.user,post=post,content="This is a comment.")
        c2 = Client(HTTP_AUTHORIZATION=f'Bearer {login.json()["access"]}')
        c2.get(f"/getcomment/{post.id}/True/")
        updated_user = User.objects.get(id=self.user.id)
        self.assertEqual(updated_user.last_comment,1)
    
    def test_user_setattr(self):
        """User.__setattr__ is OK."""
        test_user = User.objects.create(username="James",password="James123") 
        self.assertTrue(test_user.profileimg.name)
        setattr(test_user,'about','My name is James.')
        self.assertEqual(test_user.about,"My name is James.")
        with open(self.test_image_path,"rb") as test_file:
            test_file = File(test_file,self.test_image_name)
            setattr(test_user,"profileimg",test_file)
            setattr(test_user,"banner",test_file)
        self.assertNotEqual(test_user.profileimg.name,self.test_image_name)
        self.assertTrue(test_user.banner.name)
        self.assertNotEqual(test_user.banner.name,self.test_image_name)

    def test_user_getfields(self):
        """User.getfields() is OK."""
        self.assertEqual(User.getfields(),[field.name for field in User._meta.get_fields()])

    def test_user_delete(self):
        """User.delete() is OK."""
        with open(self.test_image_path,"rb") as test_file:
            test_file = File(test_file,self.test_image_name)
            test_user = User.objects.create(username="Joe",password="Joe123",banner=test_file) 
        self.assertTrue(isfile(join(MEDIA_ROOT,"user",test_file.name)))
        test_user.delete()
        self.assertFalse(User.objects.filter(id=test_user.id))
        self.assertFalse(isfile(join(MEDIA_ROOT,"user",test_file.name)))
                    