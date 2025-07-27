# 🚀 Shopiet Docker Setup - Complete Instructions

## 📋 What This Package Contains

This zip file contains all the necessary files to fix your Django SECRET_KEY error and set up a complete local Docker development environment for your Shopiet e-commerce application.

## 📁 Files Included

1. `docker-compose.yml` - Main orchestration file
2. `.env` - Environment variables with secure SECRET_KEY
3. `Backend_Dockerfile` - Backend container configuration  
4. `Frontend_Dockerfile` - Frontend container configuration
5. `django_settings_updates.py` - Django settings modifications
6. `requirements_additions.txt` - Additional Python packages needed
7. `vite.config.js` - Frontend development server configuration
8. `SETUP_INSTRUCTIONS.md` - This file

## 🎯 Step-by-Step Setup

### Step 1: Place Files in Correct Locations

1. **Project Root** (Shopiet-demo/):
   - `docker-compose.yml` → Replace existing or create new
   - `.env` → Create new file (never commit this to git!)

2. **Backend Directory** (Backend(Docked)/):
   - `Backend_Dockerfile` → Rename to `Dockerfile` and replace existing
   - Copy settings from `django_settings_updates.py` into your `backend/settings.py`
   - Add lines from `requirements_additions.txt` to your `requirements.txt`

3. **Frontend Directory** (Frontend/):
   - `Frontend_Dockerfile` → Rename to `Dockerfile` and replace existing  
   - `vite.config.js` → Replace existing or create new

### Step 2: Update Django Settings

Open `Backend(Docked)/backend/settings.py` and make these changes:

#### A. Add imports at the top:
```python
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
```

#### B. Replace SECRET_KEY line:
```python
# OLD: SECRET_KEY = 'your-old-key'
# NEW:
SECRET_KEY = os.getenv('SECRET_KEY', 'fallback-secret-key-for-development-only')
```

#### C. Update DEBUG setting:
```python
DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'
```

#### D. Update ALLOWED_HOSTS:
```python
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')
```

#### E. Replace DATABASES configuration:
```python
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
```

#### F. Add CORS settings (add to end of settings.py):
```python
# CORS settings for frontend communication
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]
```

#### G. Add static/media files configuration:
```python
# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Media files (User uploads)
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
```

#### H. Make sure 'corsheaders' is in INSTALLED_APPS:
```python
INSTALLED_APPS = [
    # ... your existing apps ...
    'corsheaders',
    # ... rest of your apps ...
]
```

#### I. Add CORS middleware to MIDDLEWARE (add as first item):
```python
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    # ... your existing middleware ...
]
```

### Step 3: Update Requirements

Add these lines to `Backend(Docked)/requirements.txt`:
```
python-dotenv>=1.0.0
psycopg2-binary>=2.9.7
django-redis>=5.3.0
django-cors-headers>=4.3.0
```

### Step 4: Remove Google Cloud Dependencies

If you still have these in your code, remove them:
- Remove `google-cloud-storage` from requirements.txt
- Remove `google-auth` from requirements.txt  
- Remove `django-storages` from requirements.txt (if present)
- Remove any imports like `from google.cloud import ...`
- Remove any `GS_` settings from settings.py

### Step 5: Start Your Application

From your project root directory:

```bash
# Stop any running containers
docker-compose down -v

# Build and start everything
docker-compose up --build

# Or run in background
docker-compose up --build -d
```

## ✅ Expected Result

After setup, you should see:

```
✅ Database container: Running on port 5432
✅ Redis container: Running on port 6379  
✅ Backend container: Running on port 8000
✅ Frontend container: Running on port 3000
```

Access your application at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Django Admin**: http://localhost:8000/admin

## 🛠️ Troubleshooting

### If backend still fails to start:

1. **Check logs**:
   ```bash
   docker-compose logs backend
   ```

2. **Verify environment variables**:
   ```bash
   docker-compose exec backend printenv | grep SECRET_KEY
   ```

3. **Test Django configuration**:
   ```bash
   docker-compose exec backend python manage.py check
   ```

### If frontend can't connect to backend:

1. **Check CORS settings** in Django settings.py
2. **Verify API URLs** in your frontend code
3. **Check network connectivity**:
   ```bash
   docker-compose exec frontend curl http://backend:8000
   ```

## 🔒 Security Notes

- The `.env` file contains your SECRET_KEY - **NEVER commit this to version control**
- Add `.env` to your `.gitignore` file
- For production, use environment variables or a secure secrets management system
- Change the default database passwords for production use

## 📚 Additional Commands

```bash
# Create Django superuser
docker-compose exec backend python manage.py createsuperuser

# Run Django migrations
docker-compose exec backend python manage.py migrate

# Collect static files
docker-compose exec backend python manage.py collectstatic

# View logs
docker-compose logs -f

# Stop containers
docker-compose down

# Remove all data (reset database)
docker-compose down -v
```

## 🎉 Success Indicators

You'll know everything is working when:

1. ✅ All 4 containers start without errors
2. ✅ Backend shows "Starting development server at http://0.0.0.0:8000/"
3. ✅ Frontend shows "Local: http://localhost:3000/"
4. ✅ You can access both frontend and backend URLs
5. ✅ No SECRET_KEY or authentication errors in logs

That's it! Your Shopiet e-commerce application should now be running completely locally with Docker, with no Google Cloud dependencies and a secure SECRET_KEY configuration.
