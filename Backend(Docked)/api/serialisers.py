from rest_framework import serializers
from shopiet.models import  Item, Images, Category, User, Profile, SavedItem, Message

class ImagesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Images
        fields = '__all__'  

class ItemSerializer(serializers.ModelSerializer):
    images = ImagesSerializer(many=True, read_only=True)
    class Meta:
        model = Item
        fields ='__all__'

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'content', 'timestamp', 'sender_username','recipient_username']

class ChatSerializer(serializers.ModelSerializer):
    unseen_count = serializers.IntegerField(read_only=True)
    class Meta:
        model = Message
        fields = ['id', 'content', 'timestamp', 'sender_username','recipient_username','viewed', 'unseen_count']




class ItemSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields =('item_name', 'slug')

class SavedItemsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedItem
        fields = '__all__'

class CategorySerializer:
    class Meta:
        model = Category
        fields = '__all__'


class AddUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2')

    def validate(self, data):
        if data["password"] != data["password2"]:
            raise serializers.ValidationError("Passwords do not match")
        return data

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"]
        )
        return user
    

    
class AddItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ('__all__')        
    
   
class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['bio', 'number', 'whatsapp_number', 'other', 'profile_pic']

    
        


    
