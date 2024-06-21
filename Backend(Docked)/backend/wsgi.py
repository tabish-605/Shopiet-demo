"""
WSGI config for backend project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

print(f"WSGI DJANGO_SETTINGS_MODULE: {os.getenv('DJANGO_SETTINGS_MODULE')}")
print(f"WSGI REDIS_URL: {os.getenv('REDIS_URL')}")



application = get_wsgi_application()

app = application
