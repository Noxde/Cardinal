from django.contrib.auth import get_user_model
from rest_framework import serializers
from backend.settings import BACKEND_DOMAIN,MEDIA_URL 

class UserSerializer(serializers.HyperlinkedModelSerializer): #Serializer for the custom user model
    following = serializers.SerializerMethodField()
    followers = serializers.SerializerMethodField()
    profileimg = serializers.SerializerMethodField()
    banner = serializers.SerializerMethodField()

    def get_banner(self,user):
        if user.banner:
            return BACKEND_DOMAIN+MEDIA_URL+user.banner.name
        
    def get_profileimg(self,user):
        if user.profileimg:
            return BACKEND_DOMAIN+MEDIA_URL+user.profileimg.name


    def get_following(self,user):
        list = []
        for user_ in user.follows.all():
            list.append(user_.username)
        return list
    
    def get_followers(self,user):
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

class ProfileSerializer(UserSerializer): #Serializer for public profiles
    following = serializers.SerializerMethodField()
    followers = serializers.SerializerMethodField()
    profileimg = serializers.SerializerMethodField()
    banner = serializers.SerializerMethodField()

    class Meta:
        model = get_user_model()
        fields = ['id',
                    'username', 
                    'about',
                    'profileimg',
                    'banner',
                    'followers',
                    'following',
                ]
