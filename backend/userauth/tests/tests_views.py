from django.test import TestCase
import userauth.views as v

class ViewsTestCase(TestCase):

    def test_is_email(self):
        """Views.is_email is OK."""
        self.assertFalse(v.is_email("ThisIsATest"))
        self.assertFalse(v.is_email("This@IsATest"))
        self.assertTrue(v.is_email("ThisIs@A.Test"))