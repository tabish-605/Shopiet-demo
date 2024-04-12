from rest_framework.response import Response
from rest_framework.decorators import api_view
from shopiet.models import Item, Category, Images
from .serialisers import ItemSerializer

@api_view(['GET'])
def getData(request):
    items = Item.objects.all()
    serializer = ItemSerializer(items, many=True)

    return Response(serializer.data)

@api_view(['POST'])
def addItem(request):
    serializer = ItemSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
