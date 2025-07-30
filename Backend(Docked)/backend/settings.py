# Django Settings Updates for Local Docker Development with OpenTelemetry Observability
# This file should replace your Backend(Docked)/backend/settings.py

import os
import logging
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
ROOT_URLCONF = 'backend.urls'

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('SECRET_KEY', 'fallback-secret-key-for-development-only')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

# OpenTelemetry Configuration
OTEL_EXPORTER_OTLP_ENDPOINT = os.getenv('OTEL_EXPORTER_OTLP_ENDPOINT', 'http://adot-collector:4318')
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT = os.getenv('OTEL_EXPORTER_OTLP_TRACES_ENDPOINT', 'http://adot-collector:4318/v1/traces')
OTEL_EXPORTER_OTLP_METRICS_ENDPOINT = os.getenv('OTEL_EXPORTER_OTLP_METRICS_ENDPOINT', 'http://adot-collector:4318/v1/metrics')
OTEL_EXPORTER_OTLP_LOGS_ENDPOINT = os.getenv('OTEL_EXPORTER_OTLP_LOGS_ENDPOINT', 'http://adot-collector:4318/v1/logs')
OTEL_SERVICE_NAME = os.getenv('OTEL_SERVICE_NAME', 'shopiet-backend')
OTEL_SERVICE_VERSION = os.getenv('OTEL_SERVICE_VERSION', '1.0.0')
OTEL_RESOURCE_ATTRIBUTES = os.getenv('OTEL_RESOURCE_ATTRIBUTES', f'service.name={OTEL_SERVICE_NAME},service.version={OTEL_SERVICE_VERSION}')

# Database Configuration - Replace your existing DATABASES setting
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('POSTGRES_DB', 'shopiet_db'),
        'USER': os.getenv('POSTGRES_USER', 'shopiet_user'),
        'PASSWORD': os.getenv('POSTGRES_PASSWORD', 'shopiet_password'),
        'HOST': os.getenv('POSTGRES_HOST', 'localhost'),
        'PORT': os.getenv('POSTGRES_PORT', '5432'),
    }
}

# Redis Configuration (if using Redis for caching or channels)
REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')

# Cache configuration (optional)
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': REDIS_URL,
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Media files (User uploads)
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# CORS settings for frontend communication
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

CORS_ALLOW_CREDENTIALS = True

# CSRF trusted origins
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

# Session configuration
SESSION_COOKIE_SECURE = False  # Set to True in production with HTTPS
CSRF_COOKIE_SECURE = False  # Set to True in production with HTTPS

# Channels configuration (if using WebSockets)
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [REDIS_URL.replace('redis://', '').split('/')[0]],
        },
    },
}

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'channels',
    'django_prometheus',  # Add Prometheus metrics
    'shopiet',
    'api',
]

MIDDLEWARE = [
    'django_prometheus.middleware.PrometheusBeforeMiddleware',  # Add at the top
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # Add CORS middleware
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django_prometheus.middleware.PrometheusAfterMiddleware',  # Add at the bottom
]

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

# JWT Configuration
from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
}

# Logging Configuration with OpenTelemetry integration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'json': {
            '()': 'pythonjsonlogger.jsonlogger.JsonFormatter',
            'format': '%(levelname)s %(asctime)s %(module)s %(process)d %(thread)d %(message)s'
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'json',
        },
        'file': {
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'django.log',
            'formatter': 'json',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
        'shopiet': {
            'handlers': ['console', 'file'],
            'level': 'DEBUG' if DEBUG else 'INFO',
            'propagate': False,
        },
        'api': {
            'handlers': ['console', 'file'],
            'level': 'DEBUG' if DEBUG else 'INFO',
            'propagate': False,
        },
    },
}

# Create logs directory if it doesn't exist
os.makedirs(BASE_DIR / 'logs', exist_ok=True)

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Custom Application Metrics Configuration
CUSTOM_METRICS_ENABLED = os.getenv('CUSTOM_METRICS_ENABLED', 'True').lower() == 'true'
METRICS_NAMESPACE = os.getenv('METRICS_NAMESPACE', 'shopiet')

# Prometheus Metrics Configuration
PROMETHEUS_METRICS_EXPORT_PORT = int(os.getenv('PROMETHEUS_METRICS_EXPORT_PORT', '8001'))
PROMETHEUS_METRICS_EXPORT_ADDRESS = os.getenv('PROMETHEUS_METRICS_EXPORT_ADDRESS', '0.0.0.0')

# Application-specific observability settings
OBSERVABILITY_CONFIG = {
    'TRACE_SAMPLING_RATE': float(os.getenv('TRACE_SAMPLING_RATE', '1.0')),
    'ENABLE_QUERY_TRACING': os.getenv('ENABLE_QUERY_TRACING', 'True').lower() == 'true',
    'ENABLE_REDIS_TRACING': os.getenv('ENABLE_REDIS_TRACING', 'True').lower() == 'true',
    'ENABLE_HTTP_TRACING': os.getenv('ENABLE_HTTP_TRACING', 'True').lower() == 'true',
    'TRACE_REQUEST_HEADERS': os.getenv('TRACE_REQUEST_HEADERS', 'True').lower() == 'true',
    'TRACE_RESPONSE_HEADERS': os.getenv('TRACE_RESPONSE_HEADERS', 'False').lower() == 'true',
}

# Business Metrics Configuration
BUSINESS_METRICS_CONFIG = {
    'TRACK_USER_ACTIONS': True,
    'TRACK_API_USAGE': True,
    'TRACK_DATABASE_OPERATIONS': True,
    'TRACK_CACHE_OPERATIONS': True,
    'TRACK_AUTHENTICATION_EVENTS': True,
}

# AWS Configuration for ADOT (if deploying to AWS)
AWS_REGION = os.getenv('AWS_REGION', 'us-east-1')
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID', '')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY', '')

# X-Ray Configuration
XRAY_TRACING_NAME = os.getenv('XRAY_TRACING_NAME', 'Shopiet-Backend')
XRAY_CONTEXT_MISSING = os.getenv('XRAY_CONTEXT_MISSING', 'LOG_ERROR')

# CloudWatch Configuration
CLOUDWATCH_LOG_GROUP = os.getenv('CLOUDWATCH_LOG_GROUP', '/aws/shopiet/backend')
CLOUDWATCH_LOG_STREAM = os.getenv('CLOUDWATCH_LOG_STREAM', 'django-app')

# Health Check Configuration
HEALTH_CHECK_ENABLED = True
HEALTH_CHECK_URL = '/health/'
