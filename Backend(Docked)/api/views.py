from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth.decorators import login_required
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from rest_framework import status
from django.db.models import Q
from django.core.cache import cache
from django.db.models.signals import post_save,  post_delete
from django.dispatch import receiver

from shopiet.models import Item, Images, User, Profile, SavedItem, Message
from .serialisers import ItemSerializer, ItemSearchSerializer, ImagesSerializer, SavedItemsSerializer
from .serialisers import AddUserSerializer, AddItemSerializer, ProfileSerializer, MessageSerializer, ChatSerializer

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from django.core.exceptions import ValidationError

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['username'] = user.username
        token['password'] = user.password
        token['id'] = user.id
            
        # ...

        return token
    

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

@api_view(['GET'])
def getData(request):
    cache_key = 'all_items'
    cached_data = cache.get(cache_key)
    
    if cached_data:
        return Response(cached_data)
    items = Item.objects.all()
    serializer = ItemSerializer(items, many=True)
    cache.set(cache_key, serializer.data, timeout=300)

    return Response(serializer.data)

@receiver(post_save, sender=Item)
@receiver(post_delete, sender=Item)
def invalidate_cache(sender, instance, **kwargs):
    cache_key = 'all_items'
    cache.delete(cache_key)

@api_view(['GET'])
def getProfile(request, username):
    username = username
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    
    try:
        profile = Profile.objects.get(user=user)
    except Profile.DoesNotExist:
        profile = Profile(user=user)
        
    user_items = Item.objects.filter(item_username=username)  
    profile_data = {
        'profile': ProfileSerializer(profile).data,
        'items': ItemSerializer(user_items, many=True).data
    }
    return Response(profile_data)

@api_view(['GET'])
def getItem(request, slug):
    cache_key = f'item_{slug}'
    cached_item = cache.get(cache_key)
        
    if cached_item:
        return Response(cached_item)
    
    try:
        item = Item.objects.get(slug=slug)
        serializer = ItemSerializer(item)
        data = serializer.data
        cache.set(cache_key, data, timeout=360)  
        return Response(data)
    except Item.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
@receiver(post_save, sender=Item)
@receiver(post_delete, sender=Item)
def invalidate_cache(sender, instance, **kwargs):
    cache_key = f'item_{instance.slug}'
    cache.delete(cache_key)
    
@api_view(['GET'])
def getConvos(request, username):
    try:
        user = User.objects.get(username=username) 
        messages = Message.objects.get_user_conversations(user)
        serializer = ChatSerializer(messages, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['GET'])
def getItemAdditionalImages(request, slug):
    item = get_object_or_404(Item, slug=slug)
    images = Images.objects.filter(item=item)
    serializer = ImagesSerializer(images, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def save_item(request, username, slug):
    if request.method == 'POST':
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        try:
            item = Item.objects.get(slug=slug)
        except Item.DoesNotExist:
            return Response({'error': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)

        if SavedItem.objects.filter(user=user, item=item).exists():
            return Response({'error': 'Item already saved'}, status=status.HTTP_400_BAD_REQUEST)

        saved_item = SavedItem(user=user, item=item)
        saved_item.save()

        serializer = SavedItemsSerializer(saved_item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['GET'])
def getSavedItems(request, username):
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
    saved_items = SavedItem.objects.filter(user=user)
    saved_item_ids = saved_items.values_list('item', flat=True)
    
    items = Item.objects.filter(pk__in=saved_item_ids)
    
    serializer = ItemSerializer(items, many=True)
    return Response(serializer.data)
   
@api_view(['POST'])
def addUser(request):
    if request.method == 'POST':
        serializer = AddUserSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data["username"]
            email = serializer.validated_data["email"]
            if User.objects.filter(username=username).exists():
                return Response({'message': 'A user with that username already exists'}, status=status.HTTP_409_CONFLICT)
            elif User.objects.filter(email=email).exists():
                return Response({'message': 'A user with that email already exists'}, status=status.HTTP_409_CONFLICT)

            user = serializer.save()

            number = request.data.get('number')
            if number:
                try:
                    profile = Profile.objects.get(user=user)
                    profile.number = number
                except Profile.DoesNotExist:
                    profile = Profile(user=user)
                    profile.number = number
                profile.save()

            response_data = {
                'message': 'User registered successfully',
                'user_id': user.id,
                'username': user.username,
                'email': user.email,
            }
            return Response(response_data, status=status.HTTP_201_CREATED)
      
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def getCatItems(request, item_category_name):
    cache_key = f'category_items_{item_category_name}'
    cached_items = cache.get(cache_key)
    
    if cached_items:
        return Response(cached_items)
    
    try:
        category_items = Item.objects.filter(item_category_name=item_category_name)
        serializer = ItemSerializer(category_items, many=True)
        data = serializer.data
        cache.set(cache_key, data, timeout=360)
        return Response(data)
    except Item.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

@receiver(post_save, sender=Item)
@receiver(post_delete, sender=Item)
def invalidate_category_cache(sender, instance, **kwargs):
    cache_key = f'category_items_{instance.item_category_name}'
    cache.delete(cache_key)



@api_view(['GET'])
def getMessages(request, roomname):
    try:
        cache_key = f'messages_{roomname}'
        cached_messages = cache.get(cache_key)
        
        if cached_messages:
            return Response(cached_messages)
        
        users = roomname.split('_')
        if len(users) != 2:
            return Response({"error": "Invalid room name"}, status=400)
        
        messages = Message.objects.filter(
            (Q(sender__username=users[0]) & Q(recipient__username=users[1])) |
            (Q(sender__username=users[1]) & Q(recipient__username=users[0]))
        ).order_by('timestamp')
        current_user = request.user.username
        is_recipient = (current_user == users[0] or current_user == users[1])
        if is_recipient:
            messages.update(viewed=True)
        

        serializer = MessageSerializer(messages, many=True)
        cache.set(cache_key, serializer.data, timeout=300)  
        return Response(serializer.data)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@receiver(post_save, sender=Message)
def invalidate_cache(sender, instance, **kwargs):
    roomname = f'{instance.sender.username}_{instance.recipient.username}'
    cache_key = f'messages_{roomname}'
    cache.delete(cache_key)
 
    reverse_roomname = f'{instance.recipient.username}_{instance.sender.username}'
    reverse_cache_key = f'messages_{reverse_roomname}'
    cache.delete(reverse_cache_key)

@api_view(['GET'])
def getSearchItems(request, search_query):
    try:
        items = Item.objects.filter(item_name__icontains=search_query)  
        serializer = ItemSearchSerializer(items, many=True)
        if serializer.data.__len__() == 0:
            return Response([{"item_name":"no results match that query"}])
        else:
            return Response(serializer.data)
        
    except Item.DoesNotExist:
        return Response({"item_name":"no results match that query"})
    
@api_view(['GET'])
def getSearchqItems(request, search_query):
    try:
        items = Item.objects.filter(item_name__icontains=search_query)  
        serializer = ItemSerializer(items, many=True)
        return Response(serializer.data)
    except Item.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def update_profile(request):

    if request.method == 'POST':
        username = request.data.get('username') 
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
    try:
        profile = Profile.objects.get(user=user)
    except Profile.DoesNotExist:
        profile = Profile(user=user)
    
    serializer = ProfileSerializer(profile, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)

@api_view(['POST'])
def addItem(request):
    if request.method == 'POST':
        item_username = request.data.get('item_username')
        try:
            user = User.objects.get(username=item_username)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = AddItemSerializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        item = serializer.save()

        if 'additional_images' in request.FILES:
            additional_images = request.FILES.getlist('additional_images')
            for image in additional_images:
                Images.objects.create(item=item, image=image)

        response_data = {
            'message': 'Item uploaded successfully',
            'slug': item.slug 
        }
        return Response(response_data, status=status.HTTP_201_CREATED)


