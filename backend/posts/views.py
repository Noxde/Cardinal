from django.http import JsonResponse
from .models import Post, PostFiles,CommentFiles, Comment
from .serializers import PostSerializer, CommentSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.contrib.auth import get_user_model




class createpost(APIView): #Creates a new post 
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        content = request.data.get('content',False)
        
        files = []
        for _ in range(10):
            file = request.data.get(str(_),False)
            if file:
                files.append(file)
            else:
                break
        
        if content:
            try:
                post = Post.objects.create(user=user,content=content)
                if files:
                    for file in files:
                        PostFiles.objects.create(post=post,file=file)

                return JsonResponse({'status':'Post Created Successfully.'}, status=201)

            except Post.DoesNotExist:
                return JsonResponse({'status':'Failed to Create Post.'}, status=500)
        
        else:
            return JsonResponse({'status':'Missing content.'}, status=400)


class delete(APIView): #Deletes a post  
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        id = request.data.get('id',False)

        if id:
            try:
                Post.objects.get(user=user,id=id).delete()
                return JsonResponse({'status':'Post Deleted Successfully.'}, status=200)

            except Post.DoesNotExist:
                return JsonResponse({'status':'Failed to Delete Post.'}, status=500)
        
        else:
            return JsonResponse({'status':'Wrong or missing id.'}, status=400)


class likes(APIView): #Adds and removes likes from posts and comments
    permission_classes = [IsAuthenticated]

    def post(self, request, context, action,id):
        user = request.user
        def postlikes():
            try:
                post = Post.objects.get(id=id)
            except Post.DoesNotExist:
                return JsonResponse({'status':'Id does not match any post.'}, status=400)
            if action == 'add':
                post.likes.add(user)
            elif action == 'remove':
                post.likes.remove(user)
            else:
               return JsonResponse({'status':'Wrong action.'}, status=400)
            
            return JsonResponse({'status':'Operation Successful.'}, status=200)

        def commentlikes():
            try:
                comment = Comment.objects.get(id=id)
            except Comment.DoesNotExist:
                return JsonResponse({'status':'Id does not match any comment.'}, status=400)
            if action == 'add':
                comment.likes.add(user)
            elif action == 'remove':
                comment.likes.remove(user)
            else:
               return JsonResponse({'status':'Wrong action.'}, status=400)
            
            return JsonResponse({'status':'Operation Successful.'}, status=200)
            
        if context == 'post':
            return postlikes()        
        
        elif context == 'comment':
            return commentlikes()        
        
        else:
            return JsonResponse({'status':'Wrong context.'}, status=400)


class getpost(APIView): #Returns posts from a user profile or from the users he follows
    permission_classes = [IsAuthenticated]

    def get(self, request , context, username, refresh):
        posts_per_scroll = 10
        loguser = request.user

        def is_false(str):
            return False if str == 'False' else str
        
        username = is_false(username)
        refresh = is_false(refresh)
        if refresh:
            loguser.last_post = 0
            loguser.save()
        if context == 'profile':
    
            try:
                user = get_user_model().objects.get(username=username)
            except get_user_model().DoesNotExist:
                return JsonResponse({'status':f'Username "{username}" did not match any user.'},status=400)           
            
            last_post = loguser.last_post
            if last_post:
                qs = Post.objects.filter(user=user,id__lt=last_post).order_by('-id')[0:posts_per_scroll]
            else:
                qs = Post.objects.filter(user=user).order_by('-id')[0:posts_per_scroll]

            if not qs:
                return JsonResponse({'status':f'Failed to get posts with id less than {last_post} from user "{user}".'},status=404)
            
            response = {}
            for n,post in enumerate(qs):
                response[str(n)] = PostSerializer(post).data

            loguser.last_post = post.id
            loguser.save()
            return JsonResponse(response,safe=False,status=200)
        
        elif context == 'feed':
            following = loguser.follows.all()
            
            last_post = loguser.last_post
            if last_post:
                qs = Post.objects.filter(user__in=following,id__lt=last_post).order_by('-id')[0:posts_per_scroll]
            else:
                qs = Post.objects.filter(user__in=following).order_by('-id')[0:posts_per_scroll]

            if not qs:
                return JsonResponse({'status':f'Failed to get posts with id less than {last_post} for user "{loguser}".'},status=404)
            
            response = {}
            for n,post in enumerate(qs):
                response[str(n)] = PostSerializer(post).data

            loguser.last_post = post.id
            loguser.save()
            return JsonResponse(response,safe=False,status=200)

        
        else:
            return JsonResponse({'status':f'Wrong context parameter.'},status=404)
        

class getcomment(APIView): #Returns comments from a post
    permission_classes = [IsAuthenticated]

    def get(self, request , id, refresh):
        comments_per_scroll = 10
        loguser = request.user
        if refresh != 'False':
            loguser.last_comment = 0
            loguser.save()
        last_comment = loguser.last_comment
        if last_comment:
            qs = Comment.objects.filter(post=id,id__lt=last_comment).order_by('-id')[0:comments_per_scroll]
        else:
            qs = Comment.objects.filter(post=id).order_by('-id')[0:comments_per_scroll]
        if not qs.exists():
            try:
                post = Post.objects.get(id = id)
            except Post.DoesNotExist:
                return JsonResponse({'status':f'Id "{id}" does not match any post.'},status=404)
            if last_comment >= len(Comment.objects.filter(post=id)):
                return JsonResponse({'status':f'There are no more available comments for post {id}.'},status=404)

        response = {}
        for n,comment in enumerate(qs):
            response[str(n)] = CommentSerializer(comment).data
        loguser.last_comment = comment.id
        loguser.save()
        return JsonResponse(response)


class createcomment(APIView): #Creates a new comment on a post 
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        content = request.data.get('content',False)
        postid = request.data.get('postid',False)

        try:
            post = Post.objects.get(id=postid)
        except Post.DoesNotExist:
            return JsonResponse({'status':'Id does not match any post.'}, status=400)

        if content:
            files = []
            for _ in range(10):
                file = request.data.get(str(_),False)
                if file:
                    files.append(file)
                else: 
                    break


            try:
                comment = Comment.objects.create(user=user,content=content,post=post)
                if files:
                    for file in files:
                        CommentFiles.objects.create(comment=comment,file=file)

                return JsonResponse({'status':'Comment Created Successfully.'}, status=201)

            except ValueError:
                return JsonResponse({'status':'Failed to Create Comment.'}, status=500)
        
        else:
            return JsonResponse({'status':'Content Parameter Missing.'}, status=400)
        

class deletecomment(APIView): #Deletes a comment  
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        commentid = request.data.get('commentid',False)

        try:
            comment = Comment.objects.get(user=user,id=commentid)
            comment.delete()
            return JsonResponse({'status':'Comment Deleted Successfully.'}, status=200)

        except Comment.DoesNotExist:
            return JsonResponse({'status':f'Id "{commentid}" does not match any comment from user "{user}".'}, status=400)