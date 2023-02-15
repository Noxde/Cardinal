from django.http import JsonResponse
from .models import Emails
from .serializers import UserSerializer, ProfileSerializer
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.middleware.csrf import get_token
# from django.http import HttpResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.decorators import api_view
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



import os

from backend import settings 



def getdatetime(date): #Returns a datetime object from a date in a string ('YYYY.MM.DD')
    try:
        split = date.split('.')
        return datetime.datetime(int(split[0]),int(split[1]),int(split[2]))
    except Exception:
        return None


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


@api_view(['POST'])
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
    datafields = moduserinfo.fields[1:]
    
    for datafield in datafields:
        data = request.data.get(datafield,False)

        if data:
            setattr(user,datafield,data)
    
    birth_date = getdatetime(request.data.get('birth_date',False))
    if birth_date:
        setattr(user,'birth_date',birth_date) 
    user.date_joined = datetime.datetime.now()

    user.save()
    if SendConfirmationEmail(request,True):
        return JsonResponse({'status':'User Created Successfully: Confirmation Email Sent'}, status=201)
    else:
        return JsonResponse({'status':'Failed to send confirmation email.'}, status=500)


class getuserinfo(APIView): #Returns all the relevant data of an user (except the password)
    permission_classes = [IsAuthenticated]

    def get(self, request):
        
        return JsonResponse(UserSerializer(get_user_model().objects.get(id=request.user.id)).data,safe=False)


def getpublicprofile(request,username): #Returns the public data of an user
    

    try:
        user = get_user_model().objects.get(username=username)
        if  not user.is_active:
            return JsonResponse({'status':f'User "{username}" is not active.'}, status=400)


    except Exception:
        return JsonResponse({'status':f'Username "{username}" does not match any user.'}, status=400)

    try:
        return JsonResponse(ProfileSerializer(user).data,safe=False,status=200)
        
    except Exception:

        return JsonResponse({'status':'Failed to serialize profile data'},status=500)


class moduserinfo(APIView): #Allows to modify user data
    permission_classes = [IsAuthenticated]

    fields=[
        'username',
        'first_name',
        'last_name',
        'about',
        'region',
        'lang',
        'birth_date',
        'profileimg',
        'banner',
        ]

    def post(self, request):       #Creates a new user with the given data
        modifiedfields = []
        user = get_user_model().objects.get(username=request.user.username)

        for datafield in self.fields:
            data = request.data.get(datafield,False)

            if data:
                    setattr(user,datafield,data)
                    modifiedfields.append(datafield)

        birth_date = getdatetime(request.data.get('birth_date',False))
        if birth_date:
            setattr(user,'birth_date',birth_date) 
            modifiedfields.append('birth_date')
        user.save()
        if modifiedfields:
            return JsonResponse({'status':'User modified Successfully.','modifiedfields':modifiedfields}, status=201)
        else:
            return JsonResponse({'status':'Failed to modify user'},status=400)

class follows(APIView): #Adds and removes users from following
    permission_classes = [IsAuthenticated]

    def post(self,request):
        action = request.POST.get('action',False)
        usernames = request.POST.getlist('usernames',False)
        if usernames:
            changes = usernames.copy()
        else:
            return JsonResponse({'status':'"usernames" parameter is wrong or misssing.'}, status=400)
        try:
            mainUser = request.user
        except Exception as e:
            print(e)
        if action == 'add':
            for username in usernames:
                try:
                    user = get_user_model().objects.get(username=username)
                    mainUser.follows.add(user)
                except Exception:
                    changes.remove(username)
            if changes:
                user.save()
                return JsonResponse({'status':'Addition successful.','changes':changes}, status=201)
            else:
                return JsonResponse({'status':'No change was made'}, status=400)
                
        elif action == 'remove':
            for username in usernames:
                try:
                    user = get_user_model().objects.get(username=username)
                    mainUser.follows.remove(user)
                except Exception:
                    changes.remove(username)
            if changes:
                user.save()
                return JsonResponse({'status':'Removal successful.','changes':changes}, status=201)
            else:
                return JsonResponse({'status':'No change was made'}, status=400)

                
        else:
            return JsonResponse({'status':'"action" parameter is wrong or misssing.'}, status=400)
            



def SendConfirmationEmail(request,from_backend=False): #Sends the confirmation email
    if from_backend:
        email = request.POST.get('email',False)
        user = get_user_model().objects.get(email=email)
    else:
        email = request.POST.get('email',False)
        try:
            user = get_user_model().objects.get(email=email)
            print(user.id)
        except Exception as e:
            print(e)
            return JsonResponse({'status':'Invalid Credentials.'}, status=400)
    
    if Emails.spam(user=user,subject=Emails.EMAILCONFIRMATION):
        return JsonResponse({'status':'Limit of sent emails exceeded, try again later.'}, status=429)

    mail_subject = 'Email confirmation.'
    message = render_to_string('emailconfirmation.html', {
        'username': user.username,
        'domain': get_current_site(request).domain,
        'uid': urlsafe_base64_encode(force_bytes(user.pk)),
        'token': account_activation_token.make_token(user),
        'protocol': 'https' if request.is_secure() else 'http'
    })
    email = EmailMessage(mail_subject, message, to=[email])
    email.content_subtype = "html"
    if from_backend:
        if email.send():
            Emails.objects.create(user=user,subject=Emails.EMAILCONFIRMATION)
            return True
        else: 
            return False
    else:
        if email.send():
            Emails.objects.create(user=user,subject=Emails.EMAILCONFIRMATION)
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

        
        return redirect(f'{settings.FRONTEND_DOMAIN}/confirmed-email/{user.username}',status='Email confirmed successfully.')
    
    else:

        return redirect(settings.FRONTEND_DOMAIN,status='Email confirmation failed.')


def ShowValidationPage(request,username): #Returns whether the frontend should render the email validation page (confimed-email/)
    try:
        user = get_user_model().objects.get(username=username)
    except Exception:
        return JsonResponse({'status':'Username "{username}" did not match any user.'}, status=400)
    
    if user.is_active and user.show_validation:
        user.show_validation = False
        user.save()
        return JsonResponse({'status':'Validation page allowed.'}, status=200)
    else:
        return JsonResponse({'status':'Validation page denied.'}, status=200)


        


