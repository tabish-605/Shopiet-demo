# Shopiet Docker Compose Setup Instructions

## 📁 File Placement Guide

After extracting this zip file, place the files in your project as follows:

```
Shopiet-demo/                     ← Your project root
├── docker-compose.yml           ← Place this file here (from zip)
├── .env                         ← Place this file here (from zip)
├── Backend(Docked)/
│   ├── Dockerfile              ← Replace existing with this file (from zip)
│   └── requirements.txt        ← ADD one line (see below)
├── Frontend/
│   ├── Dockerfile              ← Create this file here (from zip)
│   └── vite.config.js          ← Create this file here (from zip)
```

## 🛠️ Required Code Changes

### 1. Update Backend Requirements
In `Backend(Docked)/requirements.txt`, add this line:
```
psycopg2-binary==2.9.9
```

### 2. Update Django Settings
In `Backend(Docked)/backend/settings.py`, make these changes:

**Add imports at the top:**
```python
import os
from dotenv import load_dotenv
load_dotenv()
```

**Replace DATABASES configuration:**
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('POSTGRES_DB', 'shopiet_db'),
        'USER': os.getenv('POSTGRES_USER', 'shopiet_user'),
        'PASSWORD': os.getenv('POSTGRES_PASSWORD', 'shopiet_password'),
        'HOST': os.getenv('POSTGRES_HOST', 'db'),
        'PORT': os.getenv('POSTGRES_PORT', '5432'),
    }
}
```

**Add CORS settings:**
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000", 
]
CORS_ALLOW_ALL_ORIGINS = True  # For development only
```

## 🚀 Start Your Application

1. Open terminal in your project root directory
2. Run this command:
```bash
docker-compose up --build
```

## 🎯 Access Your Application

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000  
- **Admin Panel**: http://localhost:8000/admin

## 📋 Useful Commands

```bash
# Start services
docker-compose up --build

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart specific service
docker-compose restart backend

# Create Django superuser
docker-compose exec backend python manage.py createsuperuser

# Access database
docker-compose exec db psql -U shopiet_user -d shopiet_db
```

## 🔧 Troubleshooting

**If you get port conflicts:**
- Change ports in docker-compose.yml
- Make sure no other services are using ports 3000, 8000, 5432, 6379

**If database connection fails:**
- Wait for database to fully start (check logs)
- Restart backend service: `docker-compose restart backend`

**If frontend doesn't hot reload:**
- Make sure volumes are properly mounted
- Check that vite.config.js is in place

## ✅ That's It!

Your complex setup is now simplified to just one command: `docker-compose up --build`
