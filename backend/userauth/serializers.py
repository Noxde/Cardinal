from django.contrib.auth import get_user_model
from rest_framework import serializers
from backend.settings import NGINX_DOMAIN,MEDIA_URL 
from posts.models import Post

class UserSerializer(serializers.HyperlinkedModelSerializer): #Serializer for the custom user model
    following = serializers.SerializerMethodField()
    followers = serializers.SerializerMethodField()
    profileimg = serializers.SerializerMethodField()
    banner = serializers.SerializerMethodField()
    post_amount = serializers.SerializerMethodField()

    def get_post_amount(self,user):
        return len(Post.objects.filter(user=user.id))
    
    def get_banner(self,user):
        if user.banner:
            return NGINX_DOMAIN+MEDIA_URL+user.banner.name
        
    def get_profileimg(self,user):
        if user.profileimg:
            return NGINX_DOMAIN+MEDIA_URL+user.profileimg.name


    def get_following(self,user):
        list = []
        for user_ in user.follows.all():
            profileimg = user_.profileimg.name
            url = NGINX_DOMAIN+MEDIA_URL+profileimg if profileimg else '' 
            list.append({
                'username':user_.username,
                'profileimg':url,
                'about':user_.about,
                })
        return list

    def get_followers(self,user):
        list = []
        for user_ in get_user_model().objects.filter(follows=user.id):
            profileimg = user_.profileimg.name
            url = NGINX_DOMAIN+MEDIA_URL+profileimg if profileimg else '' 
            list.append({
                'username':user_.username,
                'profileimg':url,
                'about':user_.about,
                })
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
                  'post_amount',
                ]

class ProfileSerializer(UserSerializer): #Serializer for public profiles
    following = serializers.SerializerMethodField()
    followers = serializers.SerializerMethodField()
    profileimg = serializers.SerializerMethodField()
    banner = serializers.SerializerMethodField()
    post_amount = serializers.SerializerMethodField()

    class Meta:
        model = get_user_model()
        fields = ['id',
                    'username', 
                    'about',
                    'profileimg',
                    'banner',
                    'followers',
                    'following',
                    'post_amount',
                ]
