from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from ..models import Post, PostFiles, Comment
from backend.settings import MEDIA_ROOT
from filecmp import cmp

class ViewsTestCase(TestCase):
    def setUp(self):
        self.user1 = get_user_model().objects.create(username="Charles",email="Charles@cardinal.com")
        self.user1.is_active = True
        self.user1.set_password("Charles123")
        self.user1.save()

        self.post1 =  Post.objects.create(content="This is a post",user=self.user1)
        
        self.comment1 = Comment.objects.create(content="This is a coment",user=self.user1,post=self.post1)

    def test_createpost(self):
        """Createpost view is OK."""

        c = Client()
        login = c.post("/login/",{"id":self.user1,"password":"Charles123"})
        c = Client(HTTP_AUTHORIZATION=f'Bearer {login.json()["access"]}')

        # Createpost with 2 images
        file1 = open(f"{MEDIA_ROOT}/tests/test_image_1.jpg", "rb")
        file2 = open(f"{MEDIA_ROOT}/tests/test_image_2.jpg", "rb")
        response = c.post("/createpost/",
                        {"content":"I like bananas.",
                        '0':file1,
                        '1':file2})
        file1.close()
        file2.close()
        self.assertEqual(response.json()["status"],"Post Created Successfully.")

        # Get the created post from the database
        post = Post.objects.get(content="I like bananas.")
        self.assertEqual(post.user,self.user1)

        # Get the files of the post
        files = PostFiles.objects.filter(post=post)
        self.assertEqual(len(files),2)
        self.assertTrue(cmp(f"{MEDIA_ROOT}/{files[0].file.name}",f"{MEDIA_ROOT}/tests/test_image_1.jpg",shallow=False))
        self.assertTrue(cmp(f"{MEDIA_ROOT}/{files[1].file.name}",f"{MEDIA_ROOT}/tests/test_image_2.jpg",shallow=False))

        # Test error response
        response = c.post("/createpost/")
        self.assertEqual(response.json()["status"],"Missing content.")

    def test_delete(self):
        """Delete view is OK."""
        c = Client()
        login = c.post("/login/",{"id":self.user1,"password":"Charles123"})
        c = Client(HTTP_AUTHORIZATION=f'Bearer {login.json()["access"]}')

        # Test error responses
        response = c.post("/delete/")
        self.assertEqual(response.json()['status'],'Wrong or missing id.')

        response = c.post("/delete/",{'id':999})
        self.assertEqual(response.json()['status'],'Failed to Delete Post.')

        # Test correct response
        self.assertTrue(Post.objects.filter(id=self.post1.id))
        response = c.post("/delete/",{'id':self.post1.id})
        self.assertEqual(response.json()['status'],'Post Deleted Successfully.')
        self.assertFalse(Post.objects.filter(id=self.post1.id))

    def test_likes(self):
        """Likes view is OK."""
        c = Client()
        login = c.post("/login/",{"id":self.user1,"password":"Charles123"})
        c = Client(HTTP_AUTHORIZATION=f'Bearer {login.json()["access"]}')

        # Test error responses
        response = c.post("/likes/test/test/5/")
        self.assertEqual(response.json()['status'],'Wrong context.')

            # Posts
        response = c.post("/likes/post/test/5/")
        self.assertEqual(response.json()['status'],'Id does not match any post.')

        response = c.post(f"/likes/post/test/{self.post1.id}/")
        self.assertEqual(response.json()['status'],'Wrong action.')

            # Comments
        response = c.post("/likes/comment/test/5/")
        self.assertEqual(response.json()['status'],'Id does not match any comment.')

        response = c.post(f"/likes/comment/test/{self.comment1.id}/")
        self.assertEqual(response.json()['status'],'Wrong action.')

        # Test success responses
            # Posts
        self.assertFalse(self.post1.likes.all())
        response = c.post(f"/likes/post/add/{self.post1.id}/")
        self.assertEqual(response.json()['status'],'Operation Successful.')
        self.assertEqual(len(self.post1.likes.all()),1)
        response = c.post(f"/likes/post/remove/{self.post1.id}/")
        self.assertEqual(response.json()['status'],'Operation Successful.')
        self.assertFalse(self.post1.likes.all())

            # Comments
        self.assertFalse(self.comment1.likes.all())
        response = c.post(f"/likes/comment/add/{self.comment1.id}/")
        self.assertEqual(response.json()['status'],'Operation Successful.')
        self.assertEqual(len(self.comment1.likes.all()),1)
        response = c.post(f"/likes/comment/remove/{self.comment1.id}/")
        self.assertEqual(response.json()['status'],'Operation Successful.')
        self.assertFalse(self.comment1.likes.all())