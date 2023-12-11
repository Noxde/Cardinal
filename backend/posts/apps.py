from django.apps import AppConfig
from django.db.models.signals import pre_delete


class PostsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'posts'

    def ready(self):
        from .models import PostFiles, CommentFiles #Models cant be imported before the app is loaded 
        pre_delete.connect(PostFiles.pre_delete)
        pre_delete.connect(CommentFiles.pre_delete)
    