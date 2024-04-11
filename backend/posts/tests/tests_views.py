from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from ..models import Post, PostFiles, Comment, CommentFiles
from backend.settings import MEDIA_ROOT
from filecmp import cmp

class ViewsTestCase(TestCase):
    def setUp(self):
        self.user1 = get_user_model().objects.create(username="Charles",email="Charles@cardinal.com")
        self.user1.is_active = True
        self.user1.set_password("Charles123")
        self.user1.save()

        self.post1 =  Post.objects.create(content="This is a post",user=self.user1)
        
        self.comment1 = Comment.objects.create(content="This is a comment",user=self.user1,post=self.post1)

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
    
    def test_getpost(self):
        """Getpost view is OK."""
        c = Client()
        login = c.post("/login/",{"id":self.user1,"password":"Charles123"})
        c = Client(HTTP_AUTHORIZATION=f'Bearer {login.json()["access"]}')

        
        # Test error responses
        response = c.get("/getpost/test/test/test/")
        self.assertEqual(response.json()['status'],'Wrong context parameter.')

        response = c.get("/getpost/profile/test/True/")
        self.assertEqual(response.json()['status'],'Username "test" did not match any user.')


        # Create posts for testing
        for i in range(11):
            Post.objects.create(content=f'A{i+1}',user=self.user1)

        user2 = get_user_model().objects.create(username="James")
        self.user1.follows.add(user2)
        for i in range(11):
            Post.objects.create(content=f'B{i+1}',user=user2)

        # Profile
        response = c.get(f"/getpost/profile/{self.user1.username}/True/")
        for i, v in enumerate(response.json().values()):
            self.assertEqual(v['content'],f'A{11-i}')
        response = c.get(f"/getpost/profile/{self.user1.username}/False/")
        self.assertEqual(response.json()['0']['content'],'A1')
        response = c.get(f"/getpost/profile/{self.user1.username}/False/")
        self.assertEqual(response.json()['status'],'Failed to get posts with id less than 1 from user "Charles".')
        response = c.get(f"/getpost/profile/{self.user1.username}/True/")
        self.assertEqual(len(response.json().keys()),10) 

        # Feed
        response = c.get(f"/getpost/feed/test/True/")
        for i, v in enumerate(response.json()):
            self.assertEqual(v['content'],f'B{11-i}')
        response = c.get(f"/getpost/feed/test/False/")
        self.assertEqual(response.json()[0]['content'],'B1')
        response = c.get(f"/getpost/feed/test/False/")
        self.assertEqual(response.json()['status'],'Failed to get posts with id less than 13 for user "Charles".')
        response = c.get(f"/getpost/feed/test/True/")
        self.assertEqual(len(response.json()),10) 

    def test_getcomment(self):
        """Getcomment view is OK."""
        c = Client()
        login = c.post("/login/",{"id":self.user1,"password":"Charles123"})
        c = Client(HTTP_AUTHORIZATION=f'Bearer {login.json()["access"]}')

        # Test error response
        response = c.get("/getcomment/999/test/")
        self.assertEqual(response.json()['status'],'Id "999" does not match any post.')

        # Create comments for testing
        for i in range(10):
            Comment.objects.create(content=f'C{i+1}',post=self.post1,user=self.user1)
        
        # Test success reponses
        response = c.get(f"/getcomment/{self.post1.id}/True/")
        for i, v in enumerate(response.json()):
            self.assertEqual(v['content'],f'C{10-i}')
        response = c.get(f"/getcomment/{self.post1.id}/False/")        
        self.assertEqual(response.json()[0]['content'],'This is a comment')
        response = c.get(f"/getcomment/{self.post1.id}/False/")
        self.assertEqual(response.json()['status'],f'There are no more available comments for post {self.post1.id}.')
        response = c.get(f"/getcomment/{self.post1.id}/True/")
        self.assertEqual(len(response.json()),10) 

    def test_createcomment(self):
        """Createcomment view is OK."""
        c = Client()
        login = c.post("/login/",{"id":self.user1,"password":"Charles123"})
        c = Client(HTTP_AUTHORIZATION=f'Bearer {login.json()["access"]}')

        # Test error responses
        response = c.post("/createcomment/")
        self.assertEqual(response.json()['status'],'Id does not match any post.')

        response = c.post("/createcomment/",{'postid':self.post1.id})
        self.assertEqual(response.json()['status'],'Content Parameter Missing.')

        # Test success reponses
        # Create comment with 2 images
        file1 = open(f"{MEDIA_ROOT}/tests/test_image_1.jpg", "rb")
        file2 = open(f"{MEDIA_ROOT}/tests/test_image_2.jpg", "rb")
        response = c.post("/createcomment/",
                        {"postid":self.post1.id,
                        "content":"I like apples.",
                        '0':file1,
                        '1':file2})
        file1.close()
        file2.close()
        self.assertEqual(response.json()["status"],"Comment Created Successfully.")

        # Get the created comment from the database
        comment = Comment.objects.get(content="I like apples.")
        self.assertEqual(comment.user,self.user1)

        # Get the files of the comment
        files = CommentFiles.objects.filter(comment=comment)
        self.assertEqual(len(files),2)
        self.assertTrue(cmp(f"{MEDIA_ROOT}/{files[0].file.name}",f"{MEDIA_ROOT}/tests/test_image_1.jpg",shallow=False))
        self.assertTrue(cmp(f"{MEDIA_ROOT}/{files[1].file.name}",f"{MEDIA_ROOT}/tests/test_image_2.jpg",shallow=False))

    def test_deletecomment(self):
        """Deletecomment view is OK."""
        c = Client()
        login = c.post("/login/",{"id":self.user1,"password":"Charles123"})
        c = Client(HTTP_AUTHORIZATION=f'Bearer {login.json()["access"]}')

        # Test error responses
        response = c.post("/deletecomment/")
        self.assertEqual(response.json()['status'],'Missing Parameter: Comment ID.')

        response = c.post("/deletecomment/",{"commentid":999})
        self.assertEqual(response.json()['status'],f'Id "999" does not match any comment from user "{self.user1.username}".')

        # Test success reponses
        self.assertEqual(Comment.objects.first(),self.comment1)
        response = c.post("/deletecomment/",{"commentid":self.comment1.id})
        self.assertEqual(response.json()['status'],f'Comment Deleted Successfully.')
        self.assertFalse(Comment.objects.all())
