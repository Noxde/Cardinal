from django.test import TestCase, Client
from django.utils.http import urlsafe_base64_encode
from django.contrib.auth import get_user_model
from django.utils.encoding import force_bytes
import userauth.views as v
from userauth.serializers import UserSerializer
from userauth.tokens import account_activation_token
from datetime import datetime

class ViewsTestCase(TestCase):

    def test_is_email(self):
        """Views.is_email() is OK."""
        self.assertFalse(v.is_email("ThisIsATest"))
        self.assertFalse(v.is_email("This@IsATest"))
        self.assertTrue(v.is_email("ThisIs@A.Test"))

    def test_getdatetime(self):
        """Views.getdatetime() is OK."""
        self.assertEqual(v.getdatetime("2024.01.03"),datetime(year=2024,month=1,day=3))
        self.assertIsNone(v.getdatetime("Test"))
    
    def test_validate_email(self):
        """Views.ValidateEmail() is OK."""
        user = get_user_model().objects.create(username="TestUser")
        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
        token = account_activation_token.make_token(user)
        self.assertFalse(v.ValidateEmail("UID64","TOKEN"))
        self.assertEqual(v.ValidateEmail(uidb64=uidb64,token=token),user)

    def test_csrf(self):
        """Csrf view is OK."""
        c = Client()
        response = c.get("/csrf/")
        self.assertTrue(response.json()['csrfToken'])

    def test_ping(self):
        """Ping view is OK."""
        c = Client()
        response = c.post("/ping/")
        self.assertTrue(response.json()['result'])
    
    def test_login(self):
        """Login view is OK."""
        login_user = get_user_model().objects.create(username="James",email='James@cardinal.com')
        login_user.is_active = True
        login_user.set_password("James123")
        login_user.save()
        c = Client()
        #Logs in using the username as id, and checks for JWTs
        response = c.post("/login/",{'id':'James','password':'James123'})   
        self.assertTrue(response.json()['refresh'])
        self.assertTrue(response.json()['access'])
        #Logs in using the email as id, and checks for JWTs
        response = c.post("/login/",{'id':'James@cardinal.com','password':'James123'})   
        self.assertTrue(response.json()['refresh'])
        self.assertTrue(response.json()['access'])
    
    def test_register(self):
        """Register view is OK."""
        c = Client()
        response = c.post("/register/",{'username':'Richard',
                                        'email':'Richard@cardinal.com',
                                        'password':'Richard123',
                                        'about':'Hi, im Richard!',
                                        'region':'Alaska'})
        self.assertEqual(response.status_code,302)
        user = get_user_model().objects.get(username='Richard',
                                            email='Richard@cardinal.com',
                                            about='Hi, im Richard!',
                                            region='Alaska')
        self.assertTrue(user.check_password('Richard123'))
        response = c.post("/register/",{'username':'Richard',
                                        'email':'Richard@cardinal.com',
                                        'password':'Richard123'})
        self.assertEqual(response.json()['status'],'Account already created. Email not confirmed.')
    
    def test_getuserinfo(self):
        """Getuserinfo view is OK."""
        user = get_user_model().objects.create(username='Nathan',email='Nathan@cardinal.com')
        user.is_active = True
        user.set_password('Nathan123')
        user.save()
        c = Client()
        #Logs in the user to get the JWTs
        login = c.post("/login/",{"id":user.username,"password":"Nathan123"})
        c = Client(HTTP_AUTHORIZATION=f'Bearer {login.json()["access"]}')
        response = c.get("/getuserinfo/")
        #Gets the user again to update the 'last_login' field
        user = get_user_model().objects.get(id=user.id)
        self.assertEqual(dict(UserSerializer(user).data),response.json())