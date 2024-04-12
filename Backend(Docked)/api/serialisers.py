from rest_framework import serializers
from shopiet.models import  Item, Images, Category

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields ='__all__'

class CategorySerializer:
    class Meta:
        model = Category
        fields = '__all__'

class ImagesSerializer:
    class Meta:
        model = Images
        fields = '__all__'      
