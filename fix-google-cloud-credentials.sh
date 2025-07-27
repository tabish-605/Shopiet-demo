#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}ðŸ”§ Shopiet Docker Setup - Google Cloud Credentials Fix${NC}"
echo -e "${BLUE}==========================================================${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}âŒ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}âŒ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

echo -e "${GREEN}âœ… Docker and Docker Compose are installed${NC}"

# Check if Google Cloud CLI is installed and authenticated
if ! command -v gcloud &> /dev/null; then
    echo -e "${YELLOW}âš ï¸  Google Cloud CLI is not installed.${NC}"
    echo -e "${YELLOW}   Please install it from: https://cloud.google.com/sdk/docs/install${NC}"
    echo -e "${YELLOW}   Then run: gcloud auth application-default login${NC}"
else
    echo -e "${GREEN}âœ… Google Cloud CLI is installed${NC}"
    
    # Check if authenticated
    if [ ! -f ~/.config/gcloud/application_default_credentials.json ]; then
        echo -e "${YELLOW}âš ï¸  Google Cloud credentials not found. Authenticating...${NC}"
        echo -e "${BLUE}Please complete the authentication in your browser${NC}"
        gcloud auth application-default login
        
        if [ ! -f ~/.config/gcloud/application_default_credentials.json ]; then
            echo -e "${RED}âŒ Authentication failed. Please run manually:${NC}"
            echo -e "${RED}   gcloud auth application-default login${NC}"
            exit 1
        fi
    fi
    echo -e "${GREEN}âœ… Google Cloud credentials found${NC}"
fi

# Create necessary directories
echo -e "${BLUE}ðŸ“ Creating necessary directories...${NC}"
mkdir -p Backend\(Docked\)
mkdir -p Frontend

# Check if requirements.txt exists and add Google Cloud dependencies
echo -e "${BLUE}ðŸ“¦ Updating Python dependencies...${NC}"
REQUIREMENTS_FILE="Backend(Docked)/requirements.txt"

if [ -f "$REQUIREMENTS_FILE" ]; then
    # Check if Google Cloud dependencies are already present
    if ! grep -q "google-cloud-storage" "$REQUIREMENTS_FILE"; then
        echo "" >> "$REQUIREMENTS_FILE"
        echo "# Google Cloud dependencies" >> "$REQUIREMENTS_FILE"
        echo "google-cloud-storage==2.10.0" >> "$REQUIREMENTS_FILE"
        echo "google-auth==2.23.4" >> "$REQUIREMENTS_FILE"
        echo -e "${GREEN}âœ… Added Google Cloud dependencies to requirements.txt${NC}"
    else
        echo -e "${GREEN}âœ… Google Cloud dependencies already present${NC}"
    fi
else
    echo -e "${YELLOW}âš ï¸  requirements.txt not found in Backend(Docked)/${NC}"
    echo -e "${YELLOW}   Creating basic requirements.txt...${NC}"
    cat > "$REQUIREMENTS_FILE" << EOF
Django>=4.0.0
djangorestframework
django-cors-headers
psycopg2-binary==2.9.9
redis
google-cloud-storage==2.10.0
google-auth==2.23.4
EOF
fi

# Create Backend Dockerfile
echo -e "${BLUE}ðŸ³ Creating Backend Dockerfile...${NC}"
cat > "Backend(Docked)/Dockerfile" << 'EOF'
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Default command
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
EOF

# Create Frontend Dockerfile
echo -e "${BLUE}ðŸ³ Creating Frontend Dockerfile...${NC}"
cat > "Frontend/Dockerfile" << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Default command
CMD ["npm", "run", "dev"]
EOF

# Create Vite config for Frontend
echo -e "${BLUE}âš™ï¸  Creating Vite configuration...${NC}"
cat > "Frontend/vite.config.js" << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    watch: {
      usePolling: true
    }
  }
})
EOF

# Create Django settings update instructions
echo -e "${BLUE}ðŸ“ Creating Django settings update guide...${NC}"
cat > "DJANGO_SETTINGS_UPDATE.txt" << 'EOF'
Add these lines to your Backend(Docked)/backend/settings.py:

1. At the top, after other imports:
   import os
   from google.oauth2 import service_account
   from dotenv import load_dotenv
   load_dotenv()

2. Update DATABASES configuration:
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

3. Add Google Cloud configuration:
   GOOGLE_APPLICATION_CREDENTIALS = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
   
   if GOOGLE_APPLICATION_CREDENTIALS and os.path.exists(GOOGLE_APPLICATION_CREDENTIALS):
       GS_CREDENTIALS = service_account.Credentials.from_service_account_file(
           GOOGLE_APPLICATION_CREDENTIALS
       )

4. Add CORS settings:
   CORS_ALLOWED_ORIGINS = [
       "http://localhost:3000",
       "http://127.0.0.1:3000",
   ]
   CORS_ALLOW_ALL_ORIGINS = True  # For development only
EOF

echo -e "${GREEN}âœ… All configuration files created successfully!${NC}"
echo ""
echo -e "${BLUE}ðŸ“‹ Next Steps:${NC}"
echo -e "${YELLOW}1. Update your Django settings.py file according to DJANGO_SETTINGS_UPDATE.txt${NC}"
echo -e "${YELLOW}2. Run: docker-compose up --build${NC}"
echo ""
echo -e "${GREEN}ðŸŽ‰ Your application will be available at:${NC}"
echo -e "${GREEN}   Frontend: http://localhost:3000${NC}"
echo -e "${GREEN}   Backend:  http://localhost:8000${NC}"
echo ""
echo -e "${BLUE}ðŸ’¡ Useful commands:${NC}"
echo -e "${BLUE}   View logs: docker-compose logs -f${NC}"
echo -e "${BLUE}   Stop services: docker-compose down${NC}"
echo -e "${BLUE}   Rebuild: docker-compose up --build${NC}"
