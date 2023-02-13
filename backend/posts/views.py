from django.http import JsonResponse
from .models import Post, Files
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView



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
        
        if content:
            try:
                post = Post.objects.create(user=user,content=content)
                if files:
                    for file in files:
                        Files.objects.create(post=post,file=file)

                return JsonResponse({'status':'Post Created Successfully.'}, status=201)

            except Exception as e:
                print(e)
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

            except Exception as e:
                print(e)
                return JsonResponse({'status':'Failed to Delete Post.'}, status=500)
        
        else:
            return JsonResponse({'status':'Wrong or missing id.'}, status=400)


class likes(APIView): #Adds and removes likes from posts  
    permission_classes = [IsAuthenticated]

    def post(self, request, context, action,id):
        user = request.user
        def postlikes():
            try:
                post = Post.objects.get(id=id)
            except Exception:
                return JsonResponse({'status':'Id does not match any post.'}, status=400)
            if action == 'add':
                post.likes.add(user)
            elif action == 'remove':
                post.likes.remove(user)
            else:
               return JsonResponse({'status':'Wrong action.'}, status=400)
            
            return JsonResponse({'status':'Operation Successful.'}, status=200)
            
        if context == 'post':
            return postlikes()        
        
        else:
            return JsonResponse({'status':'Wrong context.'}, status=400)





