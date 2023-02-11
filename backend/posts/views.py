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
                        print(file)
                        Files.objects.create(post=post,file=file)

                return JsonResponse({'status':'Post Created Successfully.'}, status=201)

            except Exception as e:
                print(e)
                return JsonResponse({'status':'Failed to Create Post.'}, status=500)
        
        else:
            return JsonResponse({'status':'Missing content.'}, status=400)


