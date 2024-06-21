import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from django.contrib.auth import get_user_model



class ChatConsumer(WebsocketConsumer):
    def connect(self):
        raw_room_name = self.scope['url_route']['kwargs']['room_name']
        users = raw_room_name.split('_')
        self.room_group_name = '_'.join(sorted(users))
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )
        self.accept()

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )
    

    def receive(self, text_data):
        from shopiet.models import Message  # Lazy import
        def get_user():
            return get_user_model()

        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        sender = text_data_json['sender']
        recipient = text_data_json['recipient']

        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender': sender,
                'recipient': recipient
            }
        )

        User = get_user()
        sender_user = User.objects.get(username=sender)
        recipient_user = User.objects.get(username=recipient)

        new_message = Message.objects.create(
            sender=sender_user,
            recipient=recipient_user,
            content=message
        )

    def chat_message(self, event):
        message = event['message']
        sender = event['sender']
        recipient = event['recipient']

        self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': message,
            'sender': sender,
            'recipient': recipient
        }))
