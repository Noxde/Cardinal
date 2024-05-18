from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from posts.models import PostFiles,CommentFiles
from django.http import JsonResponse 
from django.db.models import Q
from .permissions import IsSuperUser
from backend.settings import MEDIA_ROOT
from os import listdir, remove
from os.path import join

class CleanupMediaFiles(APIView): 
    """Deletes unused media files."""
    permission_classes = [IsAuthenticated, IsSuperUser]

    def post(self, request):       
        amounts = {"user_files":0,"post_files":0} 

        #USER FILES
        for file in listdir(f"{MEDIA_ROOT}/user/"):
            qs = f"user/{file}"
            if (not (get_user_model().objects.filter(Q(profileimg=qs) | Q(banner=qs)))) and (qs!="user/profile_placeholder.png"):
                try:
                    remove(join(MEDIA_ROOT,qs))
                    amounts['user_files']+=1
                except (OSError, FileNotFoundError):
                    continue

        #POST FILES
        for file in listdir(f"{MEDIA_ROOT}/post/"):
            qs = f"post/{file}"
            if (not ((PostFiles.objects.filter(file=qs)) or (CommentFiles.objects.filter(file=qs)))):
                try:
                    remove(join(MEDIA_ROOT,qs))
                    amounts['post_files']+=1
                except (OSError, FileNotFoundError):
                    continue

        return JsonResponse({'status':'Media Files Cleaned Successfully.',
                             'files_deleted':amounts},status=200)