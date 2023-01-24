from django.contrib.auth import get_user_model
from rest_framework import serializers

class UserSerializer(serializers.HyperlinkedModelSerializer): #Serializer for the custom user model
    class Meta:
        model = get_user_model()
        fields = ['id',
                  'username', 
                  'email',
                  'first_name',
                  'last_name',
                  'about',
                  'region',
                  'lang',
                  'birth_date',
                  'date_joined',
                  'last_login',
                ]