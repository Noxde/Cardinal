from rest_framework import serializers
from backend.settings import BACKEND_DOMAIN,MEDIA_URL 
from .models import Post, Files, Comment

class PostSerializer(serializers.ModelSerializer): #Serializer for the Post model
    likes = serializers.SerializerMethodField()
    author = serializers.SerializerMethodField()
    files = serializers.SerializerMethodField()

    def get_likes(self,post):
        list = []
        for user_ in post.likes.all():
            list.append(user_.username)
        return list
        
    def get_author(self,post):
        profileimg = post.user.profileimg.name
        url = BACKEND_DOMAIN+MEDIA_URL+profileimg if profileimg else '' 
            
        return {'username':post.user.username,
                'profileimg':url
        }

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
                'author',
                'creation_time',
                'content',
                'likes',
                'files',
                    ]


class CommentSerializer(serializers.ModelSerializer): #Serializer for the Comment model
    class Meta:
        model = Comment
        fields = [
                 'id',
                 'user',
                 'post',
                 'content',
                 'creation_time',
                 ]
        
