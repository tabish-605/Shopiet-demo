"""
ASGI config for backend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import backend.routing
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

print(f"ASGI DJANGO_SETTINGS_MODULE: {os.getenv('DJANGO_SETTINGS_MODULE')}")
print(f"ASGI REDIS_URL: {os.getenv('REDIS_URL')}")
application = ProtocolTypeRouter({
    'http':get_asgi_application(),
'websocket':AuthMiddlewareStack(
    URLRouter(
        backend.routing.websocket_urlpatterns
    )
)
})
