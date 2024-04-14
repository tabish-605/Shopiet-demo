from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from shopiet.models import Item, Category, Images, User
from .serialisers import ItemSerializer
from .serialisers import AddUserSerializer

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['username'] = user.username
        # ...

        return token
    

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

@api_view(['GET'])
def getData(request):
    items = Item.objects.all()
    serializer = ItemSerializer(items, many=True)

    return Response(serializer.data)

@api_view(['POST'])
def addUser(request):
    if request.method == 'POST':
        serializer = AddUserSerializer(data=request.data)
        if serializer.is_valid():
            # Save the user object
            user = serializer.save()
            # Optionally, you may customize the response data
            response_data = {
                'message': 'User registered successfully',
                'user_id': user.id,
                'username': user.username,
                'email': user.email,
            }
            # Return a success response with status code 201 (created)
            return Response(response_data, status=status.HTTP_201_CREATED)
        # If the request data is invalid, return an error response
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def addItem(request):
    serializer = ItemSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

