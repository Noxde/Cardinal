from rest_framework import serializers
from backend.settings import BACKEND_DOMAIN,MEDIA_URL 
from .models import Post, Files

class PostSerializer(serializers.ModelSerializer): #Serializer for the Post model
    likes = serializers.SerializerMethodField()
    user = serializers.SerializerMethodField()
    files = serializers.SerializerMethodField()

    def get_likes(self,post):
        list = []
        for user_ in post.likes.all():
            list.append(user_.username)
        return list
        
    def get_user(self,post):

        return post.user.username

    def get_files(self,post):
        fileslist = []
        files = Files.objects.filter(post=post)
        if files:
            for file in files:
                fileslist.append(BACKEND_DOMAIN+MEDIA_URL+file.file.name)
            return fileslist

    class Meta:
        model = Post
        fields = [
                'id',
                'user',
                'creation_time',
                'content',
                'likes',
                'files',
                    ]

