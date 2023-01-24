from django.http import JsonResponse
from .models import User 
from .serializers import UserSerializer
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.http import HttpResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.views.decorators.http import require_POST, require_GET
# from django.views.decorators.csrf import ensure_csrf_cookie, requires_csrf_token, csrf_protect
import datetime
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken


def getdatetime(date): #Returns a datetime object from a date in a string ('YYYY.MM.DD')
    split = date.split('.')
    return datetime.datetime(int(split[0]),int(split[1]),int(split[2]))

@require_GET
def csrf(request): #Returns the csrf token
    return JsonResponse({'csrfToken': get_token(request)})


def ping(request):   #Works to validate the csrf token when given a post request
    return JsonResponse({'result': 'OK'})


@require_POST    #Logs in an user and returns JWT tokens.
def login(request):
    username = request.POST.get('username',False)
    email = request.POST.get('email',False)
    password = request.POST.get('password',False)
    
    def getuser(username):
        try:
            return get_user_model().objects.get(username=username)
        except Exception:
            return None
    if email:
        try:
            user = get_user_model().objects.get(email=email)
        except Exception:
            user = getuser(username)
    elif username:
        user = getuser(username)
    if user and user.check_password(raw_password=password):
        refresh = RefreshToken.for_user(user)
        user.last_login=timezone.now()
        user.save()
        return JsonResponse({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
    else:
        return HttpResponse('Invalid Credentials.', status=400)


@require_POST
def register(request):       #Creates a new user with the given data
    data = {
    'username' : request.POST.get('username',False),
    'email' : request.POST.get('email',False),
    'password' : request.POST.get('password',False),
    }

    for key,value in data.items():
        if not value:
            return HttpResponse(f'{key} missing.', status=400)

    response=[]
    if  get_user_model().objects.filter(username=data['username']).exists():
        response.append('Username')
    if  get_user_model().objects.filter(email=data['email']).exists():
        response.append('Email')
    if len(response)==2:
        return HttpResponse('Username and Email already in use.', status=400)
    elif len(response)==1:
        return HttpResponse(f'{response[0]} missing.', status=400)

    user = get_user_model().objects.create_user(username=data['username'],email=data['email'],password=data['password'])
    datafields = User.getfields()
    
    for datafield in datafields:
        data = request.POST.get(datafield,False)

        if data:
            if datafield == 'birth_date':
                setattr(user,datafield,getdatetime(data))
                
            else:
                setattr(user,datafield,data)
            
    user.date_joined = datetime.datetime.now()

    user.save()
    return HttpResponse('User Created Successfully.', status=201)


class getuserinfo(APIView): #Returns all the relevant data of an user (except the password)
    permission_classes = [IsAuthenticated]

    def get(self, request):

        return JsonResponse(UserSerializer(get_user_model().objects.get(username=request.user.username)).data,safe=False)


class moduserinfo(APIView): #Allows to modify user data
    permission_classes = [IsAuthenticated]

    def post(self, request):       #Creates a new user with the given data
        
        user = get_user_model().objects.get(username=request.user.username)
        datafields = User.getfields()
        for datafield in datafields:
            data = request.POST.get(datafield,False)

        if data:
            if datafield == 'birth_date':
                setattr(user,datafield,getdatetime(data))
                
            else:
                setattr(user,datafield,data)
        user.save()
        return HttpResponse('User Created Successfully.', status=201)





        
        

            









