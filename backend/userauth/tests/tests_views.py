from django.test import TestCase
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.contrib.auth import get_user_model
from django.utils.encoding import force_bytes, force_str
import userauth.views as v
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