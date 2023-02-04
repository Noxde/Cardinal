from django.contrib.auth import get_user_model
from rest_framework import serializers

class UserSerializer(serializers.HyperlinkedModelSerializer): #Serializer for the custom user model
    following = serializers.SerializerMethodField('following_')
    followers = serializers.SerializerMethodField('followers_')


    def following_(self,user):
        list = []
        for user_ in user.follows.all():
            list.append(user_.username)
        return list
    
    def followers_(self,user):
        list = []
        for user_ in get_user_model().objects.filter(follows=user.id):
            list.append(user_.username)
        return list

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
                  'profileimg',
                  'banner',
                  'followers',
                  'following',

                ]