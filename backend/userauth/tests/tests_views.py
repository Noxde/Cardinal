from django.test import TestCase, Client
from django.utils.http import urlsafe_base64_encode
from django.contrib.auth import get_user_model
from django.utils.encoding import force_bytes
from django.core import mail
import userauth.views as v
from userauth.serializers import UserSerializer, ProfileSerializer
from userauth.tokens import account_activation_token
from datetime import datetime
import re
from decouple import config

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
        
    def test_getpublicprofile(self):
        """Getpublicprofile view is OK."""
        c = Client()
        response = c.get("/getpublicprofile/James/")
        self.assertEqual(response.json()['status'],'Username "James" does not match any user.')
        user = get_user_model().objects.create(username='James',
                                               email='James@cardinal.com',
                                               about='My name is James.',
                                               lang='Italian')
        user.set_password('James123')
        user.save()
        response = c.get("/getpublicprofile/James/")
        self.assertEqual(response.json()['status'],'User "James" is not active.')
        user.is_active = True 
        user.save()
        response = c.get("/getpublicprofile/James/")
        self.assertEqual(ProfileSerializer(user).data,response.json())

    def test_moduserinfo(self):
        """Moduserinfo view is OK."""
        user = get_user_model().objects.create(username='Aaron',
                                               email='Aaron@cardinal.com',
                                               about="I like tables.",
                                               last_name='Mc Gill')
        user.is_active = True
        user.set_password('Aaron123')
        user.save()
        c = Client()
        #Logs in the user to get the JWTs
        login = c.post("/login/",{"id":user.username,"password":"Aaron123"})
        c = Client(HTTP_AUTHORIZATION=f'Bearer {login.json()["access"]}')
        response = c.post("/moduserinfo/")
        self.assertEqual(response.json()['status'],'Failed to modify user')
        response = c.get("/getuserinfo/")
        self.assertEqual(response.json()['about'],'I like tables.')
        self.assertEqual(response.json()['last_name'],'Mc Gill')
        response = c.post("/moduserinfo/",{'about':'I like chairs.','last_name':'Peterson'})
        self.assertEqual(response.json()['status'],'User modified Successfully.')
        self.assertEqual(response.json()['modifiedfields'],['last_name','about'])
        response = c.get("/getuserinfo/")
        self.assertEqual(response.json()['about'],'I like chairs.')
        self.assertEqual(response.json()['last_name'],'Peterson')

    def test_follows(self):
        """Follows view is OK."""
        c = Client()
        user = get_user_model().objects.create(username='Paul',email='Paul@cardinal.com')
        user.is_active = True
        user.set_password('Paul123')
        user.save()
        c = Client()
        #Logs in the user to get the JWTs
        login = c.post("/login/",{"id":user.username,"password":"Paul123"})
        c = Client(HTTP_AUTHORIZATION=f'Bearer {login.json()["access"]}')
        response = c.post("/follows/")
        self.assertEqual(response.json()['status'],'"usernames" parameter is wrong or missing.')   
        response = c.post("/follows/",{'usernames':['Lyla','Homer']})
        self.assertEqual(response.json()['status'],'"action" parameter is wrong or missing.')   
        response = c.post("/follows/",{'usernames':['Lyla','Homer'],'action':'remove'})
        self.assertEqual(response.json()['status'],'No change was made')  
        get_user_model().objects.create(username='Lyla',email='Lyla@cardinal.com')
        get_user_model().objects.create(username='Homer',email='Homer@cardinal.com')
        response = c.post("/follows/",{'usernames':['Lyla','Homer'],'action':'add'})
        self.assertEqual(response.json()['status'],'Addition successful.')  
        self.assertEqual(response.json()['changes'],['Lyla','Homer'])  
        response = c.post("/follows/",{'usernames':['Carl','Nicholas'],'action':'add'})
        self.assertEqual(response.json()['status'],'No change was made')  

    def test_send_email(self):
        """SendEmail view is OK."""
        gmail_address = config('GMAIL_ADDRESS')
        user = get_user_model().objects.create(username='Tester',email=gmail_address,password='Plain text',is_active=True)
        c = Client()
        #Test for EC emails
        response = c.get(f'/sendemail/EC/{gmail_address}/')
        self.assertEqual(response.json()['status'],'Email confirmation email sent.')
        self.assertEqual(mail.outbox[-1].subject,'Email confirmation.')
        link = re.search('href=".+"',mail.outbox[-1].body).group()
        uidb64 = link.split('/')[-2]
        token = link.split('/')[-1].split('"')[0]
        self.assertEqual(v.ValidateEmail(uidb64=uidb64,token=token),user)
        #Test for PR emails
        response = c.get(f'/sendemail/PR/{gmail_address}/')
        self.assertEqual(response.json()['status'],'Password reset email sent.')
        self.assertEqual(mail.outbox[-1].subject,'Password reset.')
        link = re.search('href=".+"',mail.outbox[-1].body).group()
        uidb64 = link.split('/')[-3]
        token = link.split('/')[-2]
        self.assertEqual(v.ValidateEmail(uidb64=uidb64,token=token),user)
        #Test for AD emails
        response = c.get(f'/sendemail/AD/{gmail_address}/')
        self.assertEqual(response.json()['status'],'Account delete email sent.')
        self.assertEqual(mail.outbox[-1].subject,'Account delete.')
        link = re.search('href=".+"',mail.outbox[-1].body).group()
        uidb64 = link.split('/')[-2]
        token = link.split('/')[-1].split('"')[0]
        self.assertEqual(v.ValidateEmail(uidb64=uidb64,token=token),user)