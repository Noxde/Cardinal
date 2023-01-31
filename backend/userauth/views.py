from django.http import JsonResponse
from .models import User 
from .serializers import UserSerializer
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.middleware.csrf import get_token
# from django.http import HttpResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.views.decorators.http import require_POST, require_GET
# from django.views.decorators.csrf import ensure_csrf_cookie, requires_csrf_token, csrf_protect
from django.shortcuts import render, redirect
import datetime
from django.utils import timezone
from django.core.mail import send_mail
from .tokens import getjwtoken

#Email confirmation
from django.template.loader import render_to_string
from django.contrib.sites.shortcuts import get_current_site
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import EmailMessage
from .tokens import account_activation_token

from backend import settings 


def SendConfirmationEmail(request,from_backend=False):
    if from_backend:
        email = request.POST.get('email',False)
        user = get_user_model().objects.get(email=email)
    else:
        username = request.POST.get('username',False)
        email = request.POST.get('email',False)
        password = request.POST.get('password',False)
        try:
            print(username,email,password)
            user = get_user_model().objects.get(username=username,email=email)
            print(user.id)
        except Exception as e:
            print(e)
            print('waswasd')
            return JsonResponse({'status':'Invalid Credentials.'}, status=400)
        if not user.check_password(raw_password=password):
            return JsonResponse({'status':'Invalid Password.'}, status=400)
    mail_subject = 'Email confirmation.'
    message = render_to_string('emailconfirmation.html', {
        'user': user.username,
        'domain': get_current_site(request).domain,
        'uid': urlsafe_base64_encode(force_bytes(user.pk)),
        'token': account_activation_token.make_token(user),
        'protocol': 'https' if request.is_secure() else 'http'
    })
    email = EmailMessage(mail_subject, message, to=[email])
    if from_backend:
        return email.send()
    elif email.send():
        return JsonResponse({'status':'Confirmation Email Sent'}, status=200)
    else:
        return JsonResponse({'status':'Failed to send confirmation email.'}, status=500)


def ConfirmEmail(request, uidb64, token):
    User = get_user_model()
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except(TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None

    if user is not None and account_activation_token.check_token(user, token):
        user.is_active = True
        user.save()

        
        return redirect(settings.FRONTEND_DOMAIN,status='Email confirmed successfully.')
    
    else:

        return redirect(settings.FRONTEND_DOMAIN,status='Email confirmation failed.')



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
    
    #If the credentials match a valid user and the password is correct
    if user and user.check_password(raw_password=password):

        #If the user's email is not confirmed
        if  not user.is_active:
            return JsonResponse({'status':'User email address is not confirmed.'}, status=403)
        user.last_login=timezone.now()
        user.save()
        return JsonResponse(getjwtoken(user))
    else:
        return JsonResponse({'status':'Invalid Credentials.'}, status=400)


@require_POST
def register(request):       #Creates a new user with the given data and sends confirmation email
    data = {
    'username' : request.POST.get('username',False),
    'email' : request.POST.get('email',False),
    'password' : request.POST.get('password',False),
    }

    #Checks for missing credentials
    for key,value in data.items():
        if not value:
            return JsonResponse({'status':f'{key} missing.'}, status=400)
    
    try: #Verifies if the account already exists and requires email confirmation
        if get_user_model().objects.get(username=data['username'],email=data['email']).is_active == 0: 
            return JsonResponse({'status':'Account already created. Email not confirmed.'}, status=403)
    except Exception:
        pass 
        

    response=[] #Verifies if the credentials are already in use
    if  get_user_model().objects.filter(username=data['username']).exists():
        response.append('Username')
    if  get_user_model().objects.filter(email=data['email']).exists():
        response.append('Email')
    if len(response)==2:
        return JsonResponse({'status':'Username and Email already in use.'}, status=400)
    elif len(response)==1:
        return JsonResponse({'status':f'{response[0]} already in use.'}, status=400)

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
    if SendConfirmationEmail(request,True):
        return JsonResponse({'status':'User Created Successfully: Confirmation Email Sent'}, status=201)
    else:
        return JsonResponse({'status':'Failed to send confirmation email.'}, status=500)


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
        return JsonResponse({'status':'User Created Successfully.'}, status=201)





        
        

            









