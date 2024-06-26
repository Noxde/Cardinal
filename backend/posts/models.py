from django.db import models
from django.contrib.auth import get_user_model


class Post(models.Model): #Model for user posts

    user = models.ForeignKey(get_user_model() , on_delete=models.CASCADE)
    creation_time = models.DateTimeField(auto_now_add=True)
    content = models.TextField(max_length=200)
    likes = models.ManyToManyField(get_user_model(),symmetrical=False,blank=True,related_name='likes')

    def get_top_comment(post): #Returns the most relevant comment from a post
        comments = Comment.objects.filter(post=post.id)
        toplikes=0
        topcomment=None
        tiecomment=None
        for comment in comments:
            likes = comment.likes.count()
            if likes>toplikes:
                topcomment=comment
                toplikes=likes
            elif likes==toplikes and likes != 0:
                tiecomment=comment
        if tiecomment and tiecomment.creation_time>topcomment.creation_time:
            return tiecomment
        elif topcomment:
            return topcomment
        elif comments.exists():
            return comments.order_by('-creation_time')[0]
    
    def get_comment_amount(post): #Returns the number of comments a post has
        return len(Comment.objects.filter(post=post.id))

class Comment(models.Model):
    user = models.ForeignKey(get_user_model() , on_delete=models.CASCADE)
    post = models.ForeignKey(Post,on_delete=models.CASCADE)
    content = models.TextField(max_length=120)
    creation_time = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(get_user_model(),symmetrical=False,blank=True,related_name='commentlikes')

class PostFiles (models.Model): #Model for posts files
    post = models.ForeignKey(Post,on_delete=models.CASCADE)
    file = models.FileField(upload_to='post/')

    def pre_delete(sender, **kwargs):   #Receiver function
        if (sender == PostFiles):    #If the object being deleted is a PostFile
            kwargs['instance'].file.delete() 

class CommentFiles (models.Model): #Model for comment files
    comment = models.ForeignKey(Comment,on_delete=models.CASCADE)
    file = models.FileField(upload_to='post/')

    def pre_delete(sender, **kwargs):   #Receiver function
        if (sender == CommentFiles):    #If the object being deleted is a CommentFile
            kwargs['instance'].file.delete() 