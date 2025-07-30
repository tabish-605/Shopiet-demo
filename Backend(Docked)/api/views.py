"""
Updated API Views with OpenTelemetry Observability
This file enhances the existing Backend(Docked)/api/views.py with comprehensive observability
"""

from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth.decorators import login_required
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from rest_framework import status
from django.db.models import Q
from django.core.cache import cache
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.exceptions import ValidationError
import time
import logging

from shopiet.models import Item, Images, User, Profile, SavedItem, Message
from api.serialisers import (ItemSerializer, ItemSearchSerializer, ImagesSerializer, 
                         SavedItemsSerializer, AddUserSerializer, AddItemSerializer, 
                         ProfileSerializer, MessageSerializer, ChatSerializer)

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

# Import observability components
from backend.custom_metrics import (
    track_http_request, trace_business_operation, track_user_registration,
    track_user_login, track_item_creation, track_item_view, track_item_save,
    track_search_operation, track_message_sent, track_cache_operation,
    track_api_performance, add_business_context
)
from opentelemetry import trace, metrics

logger = logging.getLogger(__name__)
tracer = trace.get_tracer(__name__)
meter = metrics.get_meter(__name__)


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['username'] = user.username
        token['password'] = user.password
        token['id'] = user.id

        return token


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        """Override to add login tracking"""
        username = request.data.get('username')
        
        with tracer.start_as_current_span("user_authentication") as span:
            span.set_attribute("auth.method", "jwt")
            span.set_attribute("auth.username", username or "unknown")
            
            try:
                response = super().post(request, *args, **kwargs)
                
                if response.status_code == 200:
                    user = User.objects.get(username=username)
                    track_user_login(user, success=True, method="jwt")
                    span.set_attribute("auth.success", True)
                    span.set_attribute("user.id", str(user.id))
                else:
                    track_user_login(User(username=username), success=False, method="jwt")
                    span.set_attribute("auth.success", False)
                
                return response
                
            except Exception as e:
                track_user_login(User(username=username), success=False, method="jwt")
                span.set_attribute("auth.success", False)
                span.set_attribute("error.message", str(e))
                raise


@api_view(['GET'])
@track_api_performance('get_data')
def getData(request):
    """Get all items with caching and observability"""
    cache_key = 'all_items'
    
    with tracer.start_as_current_span("get_all_items") as span:
        span.set_attribute("cache.key", cache_key)
        
        # Check cache first
        cached_data = cache.get(cache_key)
        if cached_data:
            track_cache_operation("get", cache_key, hit=True)
            span.set_attribute("cache.hit", True)
            span.set_attribute("items.count", len(cached_data))
            return Response(cached_data)
        
        track_cache_operation("get", cache_key, hit=False)
        span.set_attribute("cache.hit", False)
        
        # Query database
        with tracer.start_as_current_span("db.query.all_items"):
            start_time = time.time()
            items = Item.objects.all()
            query_duration = time.time() - start_time
            
            serializer = ItemSerializer(items, many=True)
            cache.set(cache_key, serializer.data, timeout=300)
            
            # Track metrics
            track_cache_operation("set", cache_key, hit=True)
            span.set_attribute("db.query.duration", query_duration)
            span.set_attribute("items.count", len(serializer.data))
            
            return Response(serializer.data)


@receiver(post_save, sender=Item)
@receiver(post_delete, sender=Item)
def invalidate_cache(sender, instance, **kwargs):
    """Invalidate cache when items change"""
    cache_key = 'all_items'
    cache.delete(cache_key)
    track_cache_operation("delete", cache_key, hit=True)


@api_view(['GET'])
@track_api_performance('get_profile')
def getProfile(request, username):
    """Get user profile with observability"""
    with track_business_operation("get_user_profile", username=username):
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
@track_api_performance('get_item')
def getItem(request, slug):
    """Get item details with caching and view tracking"""
    cache_key = f'item_{slug}'
    
    with tracer.start_as_current_span("get_item_details") as span:
        span.set_attribute("item.slug", slug)
        
        # Check cache
        cached_item = cache.get(cache_key)
        if cached_item:
            track_cache_operation("get", cache_key, hit=True)
            span.set_attribute("cache.hit", True)
            
            # Track view
            user_id = str(request.user.id) if request.user.is_authenticated else None
            track_item_view(slug, user_id)
            
            return Response(cached_item)

        track_cache_operation("get", cache_key, hit=False)
        span.set_attribute("cache.hit", False)

        try:
            item = Item.objects.get(slug=slug)
            serializer = ItemSerializer(item)
            data = serializer.data
            cache.set(cache_key, data, timeout=360)
            
            # Track view and cache set
            user_id = str(request.user.id) if request.user.is_authenticated else None
            track_item_view(slug, user_id, item.item_category_name)
            track_cache_operation("set", cache_key, hit=True)
            
            span.set_attribute("item.category", item.item_category_name)
            span.set_attribute("item.price", float(item.item_price))
            
            return Response(data)
            
        except Item.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@track_api_performance('get_conversations')
def getConvos(request, username):
    """Get user conversations with observability"""
    with track_business_operation("get_conversations", username=username):
        try:
            user = User.objects.get(username=username)
            messages = Message.objects.get_user_conversations(user)
            serializer = ChatSerializer(messages, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error getting conversations for {username}: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@track_api_performance('get_item_images')
def getItemAdditionalImages(request, slug):
    """Get additional images for an item"""
    with track_business_operation("get_item_images", item_slug=slug):
        item = get_object_or_404(Item, slug=slug)
        images = Images.objects.filter(item=item)
        serializer = ImagesSerializer(images, many=True)
        return Response(serializer.data)


@api_view(['POST'])
@track_api_performance('save_item')
def save_item(request, username, slug):
    """Save/unsave item with observability"""
    if request.method == 'POST':
        with track_business_operation("save_item", username=username, item_slug=slug):
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

            # Track the save action
            track_item_save(slug, str(user.id), "save")

            serializer = SavedItemsSerializer(saved_item)
            return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@track_api_performance('get_saved_items')
def getSavedItems(request, username):
    """Get user's saved items"""
    with track_business_operation("get_saved_items", username=username):
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
@track_api_performance('add_user')
def addUser(request):
    """User registration with observability"""
    if request.method == 'POST':
        with track_business_operation("user_registration"):
            serializer = AddUserSerializer(data=request.data)
            if serializer.is_valid():
                username = serializer.validated_data["username"]
                email = serializer.validated_data["email"]
                
                if User.objects.filter(username=username).exists():
                    return Response({'message': 'A user with that username already exists'}, 
                                  status=status.HTTP_409_CONFLICT)
                elif User.objects.filter(email=email).exists():
                    return Response({'message': 'A user with that email already exists'}, 
                                  status=status.HTTP_409_CONFLICT)

                user = serializer.save()

                # Handle phone number
                number = request.data.get('number')
                if number:
                    try:
                        profile = Profile.objects.get(user=user)
                        profile.number = number
                    except Profile.DoesNotExist:
                        profile = Profile(user=user)
                        profile.number = number
                    profile.save()

                # Track registration
                track_user_registration(user, "web")

                response_data = {
                    'message': 'User registered successfully',
                    'user_id': user.id,
                    'username': user.username,
                    'email': user.email,
                }
                return Response(response_data, status=status.HTTP_201_CREATED)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@track_api_performance('get_category_items')
def getCatItems(request, item_category_name):
    """Get items by category with caching"""
    cache_key = f'category_items_{item_category_name}'
    
    with tracer.start_as_current_span("get_category_items") as span:
        span.set_attribute("category.name", item_category_name)
        
        cached_items = cache.get(cache_key)
        if cached_items:
            track_cache_operation("get", cache_key, hit=True)
            span.set_attribute("cache.hit", True)
            return Response(cached_items)

        track_cache_operation("get", cache_key, hit=False)
        span.set_attribute("cache.hit", False)

        try:
            category_items = Item.objects.filter(item_category_name=item_category_name)
            serializer = ItemSerializer(category_items, many=True)
            data = serializer.data
            cache.set(cache_key, data, timeout=360)
            
            track_cache_operation("set", cache_key, hit=True)
            span.set_attribute("items.count", len(data))
            
            return Response(data)
        except Item.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)


@receiver(post_save, sender=Item)
@receiver(post_delete, sender=Item)
def invalidate_category_cache(sender, instance, **kwargs):
    """Invalidate category cache when items change"""
    cache_key = f'category_items_{instance.item_category_name}'
    cache.delete(cache_key)
    track_cache_operation("delete", cache_key, hit=True)


@api_view(['GET'])
@track_api_performance('get_messages')
def getMessages(request, roomname):
    """Get messages with caching and observability"""
    with track_business_operation("get_messages", room=roomname):
        try:
            cache_key = f'messages_{roomname}'
            cached_messages = cache.get(cache_key)

            if cached_messages:
                track_cache_operation("get", cache_key, hit=True)
                return Response(cached_messages)

            track_cache_operation("get", cache_key, hit=False)

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
            track_cache_operation("set", cache_key, hit=True)
            
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error getting messages for room {roomname}: {e}")
            return Response({"error": str(e)}, status=500)


@receiver(post_save, sender=Message)
def invalidate_message_cache(sender, instance, **kwargs):
    """Invalidate message cache and track message"""
    roomname = f'{instance.sender.username}_{instance.recipient.username}'
    cache_key = f'messages_{roomname}'
    cache.delete(cache_key)
    
    reverse_roomname = f'{instance.recipient.username}_{instance.sender.username}'
    reverse_cache_key = f'messages_{reverse_roomname}'
    cache.delete(reverse_cache_key)
    
    # Track message sent
    track_message_sent(
        str(instance.sender.id), 
        str(instance.recipient.id), 
        len(instance.content)
    )


@api_view(['GET'])
@track_api_performance('search_items')
def getSearchItems(request, search_query):
    """Search items with observability"""
    start_time = time.time()
    user_id = str(request.user.id) if request.user.is_authenticated else None
    
    with track_business_operation("search_items", query=search_query[:50]):
        try:
            items = Item.objects.filter(item_name__icontains=search_query)
            serializer = ItemSearchSerializer(items, many=True)
            
            results_count = len(serializer.data)
            track_search_operation(search_query, user_id, results_count)
            
            if results_count == 0:
                return Response([{"item_name": "no results match that query"}])
            else:
                return Response(serializer.data)

        except Item.DoesNotExist:
            track_search_operation(search_query, user_id, 0)
            return Response({"item_name": "no results match that query"})


@api_view(['GET'])
@track_api_performance('search_items_detailed')
def getSearchqItems(request, search_query):
    """Detailed search with full item data"""
    user_id = str(request.user.id) if request.user.is_authenticated else None
    
    with track_business_operation("search_items_detailed", query=search_query[:50]):
        try:
            items = Item.objects.filter(item_name__icontains=search_query)
            serializer = ItemSerializer(items, many=True)
            
            track_search_operation(search_query, user_id, len(serializer.data))
            return Response(serializer.data)
        except Item.DoesNotExist:
            track_search_operation(search_query, user_id, 0)
            return Response(status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@track_api_performance('update_profile')
def update_profile(request):
    """Update user profile with observability"""
    if request.method == 'POST':
        username = request.data.get('username')
        
        with track_business_operation("update_profile", username=username):
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
@track_api_performance('add_item')
def addItem(request):
    """Add new item with observability"""
    if request.method == 'POST':
        item_username = request.data.get('item_username')
        
        with track_business_operation("add_item", username=item_username):
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

            # Handle additional images
            if 'additional_images' in request.FILES:
                additional_images = request.FILES.getlist('additional_images')
                for image in additional_images:
                    Images.objects.create(item=item, image=image)

            # Track item creation
            track_item_creation(
                item.slug, 
                str(user.id), 
                getattr(item, 'item_category_name', 'unknown')
            )

            response_data = {
                'message': 'Item uploaded successfully',
                'slug': item.slug
            }
            return Response(response_data, status=status.HTTP_201_CREATED)


# Health check endpoint
@api_view(['GET'])
def health_check(request):
    """Health check endpoint with observability status"""
    from backend.custom_metrics import get_metrics_health
    
    health_data = {
        "status": "healthy",
        "timestamp": time.time(),
        "observability": get_metrics_health()
    }
    
    return Response(health_data, status=status.HTTP_200_OK)
