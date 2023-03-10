from rest_framework import serializers
from backend.settings import BACKEND_DOMAIN,MEDIA_URL 
from .models import Post, PostFiles, CommentFiles, Comment

class PostSerializer(serializers.ModelSerializer): #Serializer for the Post model
    likes = serializers.SerializerMethodField()
    author = serializers.SerializerMethodField()
    files = serializers.SerializerMethodField()

    def get_likes(self,post):
        list = []
        for user_ in post.likes.all():
            profileimg = user_.profileimg.name
            url = BACKEND_DOMAIN+MEDIA_URL+profileimg if profileimg else '' 
            list.append({
                'username':user_.username,
                'profileimg':url,
                })
        return list
        
    def get_author(self,post):
        profileimg = post.user.profileimg.name
        url = BACKEND_DOMAIN+MEDIA_URL+profileimg if profileimg else '' 
            
        return {'username':post.user.username,
                'profileimg':url
        }

    def get_files(self,post):
        fileslist = []
        files = PostFiles.objects.filter(post=post)
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
    files = serializers.SerializerMethodField()
    author = serializers.SerializerMethodField()
    likes = serializers.SerializerMethodField()

    def get_likes(self,comment):
        list = []
        for user_ in comment.likes.all():
            profileimg = user_.profileimg.name
            url = BACKEND_DOMAIN+MEDIA_URL+profileimg if profileimg else '' 
            list.append({
                'username':user_.username,
                'profileimg':url,
                })
        return list

    def get_files(self,comment):
        fileslist = []
        files = CommentFiles.objects.filter(comment=comment)
        if files:
            for file in files:
                fileslist.append(BACKEND_DOMAIN+MEDIA_URL+file.file.name)
            return fileslist

    def get_author(self,comment):
        profileimg = comment.user.profileimg.name
        url = BACKEND_DOMAIN+MEDIA_URL+profileimg if profileimg else '' 
            
        return {'username':comment.user.username,
                'profileimg':url
        }
    
    class Meta:
        model = Comment
        fields = [
                 'id',
                 'author',
                 'post',
                 'content',
                 'creation_time',
                 'files',
                 'likes',
                 ]
