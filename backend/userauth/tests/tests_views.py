from django.test import TestCase
import userauth.views as v
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