from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.tokens import PasswordResetTokenGenerator
import six  

def getjwtoken(user):
    refresh = RefreshToken.for_user(user)
    refresh['username'] = user.username
    
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class AccountActivationTokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, user, timestamp):
        return (
            six.text_type(user.pk) + six.text_type(timestamp)  + six.text_type(user.is_active)
        )

account_activation_token = AccountActivationTokenGenerator()

