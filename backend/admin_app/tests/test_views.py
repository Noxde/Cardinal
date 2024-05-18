from django.test import TestCase, Client
from django.contrib.auth import get_user_model

class ViewsTestCase(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create(username="user",email="user@cardinal.com")
        self.user.is_active = True
        self.user.set_password("user")
        self.user.save()

        self.admin = get_user_model().objects.create_superuser(username="admin",email="admin@cardinal.com")
        self.admin.is_active = True
        self.admin.set_password("admin")
        self.admin.save()

    def test_cleanupmediafiles(self):
        """CleanupMediaFiles() protection is OK."""
        user_client = Client()

        #Test the response without logging in
        response = user_client.post("/mediafiles/cleanup/")
        self.assertEqual(response.json()['detail'],'Authentication credentials were not provided.')
        
        #Test the response logging in (no superuser)
        login = user_client.post("/login/",{"id":self.user.username,"password":self.user.username})
        user_client = Client(HTTP_AUTHORIZATION=f'Bearer {login.json()["access"]}')
        response = user_client.post("/mediafiles/cleanup/")
        self.assertEqual(response.json()['detail'],'Access Denied: Must be superuser.')

        #Cannot test successful case as it would wipe all media files