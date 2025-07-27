# 🚀 Shopiet E-commerce Docker Setup - Complete Installation Guide

## 📋 Quick Setup Overview

This package contains everything you need to get your Shopiet e-commerce application running with **one command** instead of complex manual setup. The solution fixes Google Cloud credentials issues and provides a complete Docker Compose environment.

## 📁 Package Contents

- `docker-compose.yml` - Main orchestration file
- `.env` - Environment variables 
- `Backend(Docked)/Dockerfile` - Backend container configuration (replace existing)
- `Frontend/Dockerfile` - Frontend container configuration (create new)
- `Frontend/vite.config.js` - Vite configuration for Frontend (create new)
- `fix-google-cloud-credentials.sh` - Linux/Mac automated setup script
- `fix-google-cloud-credentials.bat` - Windows automated setup script
- `requirements-additions.txt` - Additional Python packages needed
- `django-settings-update.md` - Complete Django configuration guide

## 🎯 What This Fixes

✅ **Google Cloud credentials error**: `DefaultCredentialsError: File shopiet-420118-0c90e2301f32.json was not found`
✅ **Complex setup process**: Reduces multi-step setup to one command
✅ **Database configuration**: Switches from CockroachDB to PostgreSQL for Docker compatibility
✅ **Frontend-Backend communication**: Proper networking and CORS setup
✅ **Development workflow**: Hot reload for both frontend and backend

## 🛠️ Prerequisites

Before starting, ensure you have:

1. **Docker Desktop** installed and running
2. **Docker Compose** (usually included with Docker Desktop)
3. **Google Cloud CLI** (gcloud) installed
4. **Git** (to clone your repository)

## 📂 File Placement Instructions

### 1. Root Directory Files (place in `Shopiet-demo/`)
- `docker-compose.yml`
- `.env`
- `fix-google-cloud-credentials.sh` (Linux/Mac)
- `fix-google-cloud-credentials.bat` (Windows)

### 2. Backend Files (place in `Backend(Docked)/`)
- `Dockerfile` (replace existing file)

### 3. Frontend Files (place in `Frontend/`)
- `Dockerfile` (create new file)
- `vite.config.js` (create new file)

## 🚀 Installation Methods

### Method 1: Automated Setup (Recommended)

#### For Linux/Mac:
```bash
# 1. Make script executable
chmod +x fix-google-cloud-credentials.sh

# 2. Run the automated setup
./fix-google-cloud-credentials.sh
```

#### For Windows:
```cmd
# Simply double-click the file or run in Command Prompt
fix-google-cloud-credentials.bat
```

### Method 2: Manual Setup

#### Step 1: Authenticate with Google Cloud
```bash
gcloud auth application-default login
```

#### Step 2: Update Requirements
Add the contents of `requirements-additions.txt` to your `Backend(Docked)/requirements.txt`

#### Step 3: Update Django Settings
Follow the complete guide in `django-settings-update.md`

#### Step 4: Start the Application
```bash
docker-compose up --build
```

## 🌐 Access Your Application

After successful setup:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Django Admin**: http://localhost:8000/admin

## 🐛 Troubleshooting

### Common Issues:

#### 1. "Permission denied" on Linux/Mac
```bash
chmod +x fix-google-cloud-credentials.sh
```

#### 2. Google Cloud credentials not found
```bash
gcloud auth application-default login
```

#### 3. Docker containers not starting
```bash
docker-compose logs backend
docker-compose logs frontend
```

### Useful Commands:

```bash
# View all container logs
docker-compose logs -f

# Restart specific service
docker-compose restart backend

# Run Django management commands
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser

# Stop all services
docker-compose down

# Rebuild and start
docker-compose up --build
```

## 🎉 Success Indicators

Your setup is successful when:
- ✅ Both frontend and backend containers are running
- ✅ Frontend loads at http://localhost:3000
- ✅ Backend API responds at http://localhost:8000
- ✅ No Google Cloud credentials errors in logs

**Congratulations!** Your Shopiet e-commerce application is now running with Docker Compose!