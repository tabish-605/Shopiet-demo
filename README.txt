# Shopiet Docker Setup - Google Cloud Credentials Fix

## Quick Start:
1. Extract all files to your Shopiet-demo project root
2. Place files in correct directories as shown in SETUP_INSTRUCTIONS.md
3. Run the setup script:
   - Linux/Mac: chmod +x fix-google-cloud-credentials.sh && ./fix-google-cloud-credentials.sh
   - Windows: double-click fix-google-cloud-credentials.bat
4. Your app will be available at:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8000

## Important:
- Read SETUP_INSTRUCTIONS.md for complete guide
- Update Django settings as described in django-settings-update.md
- Ensure Google Cloud CLI is installed and authenticated

## What This Fixes:
✅ Google Cloud credentials error
✅ Complex setup process → One command setup
✅ Database configuration (PostgreSQL)
✅ Frontend-Backend communication
✅ Development workflow with hot reload

Created: 2025-07-27 10:52:15


docker compose exec logstash bash -c "cp -r /usr/share/logstash/patterns/* /usr/share/logstash/patterns_custom"



docker compose exec logstash bash -c "tar cf - -C /usr/share/logstash/patterns_custom ." \
  | tar xf - -C observability/logstash/patterns




logstash:
  # ... existing config ...
  volumes:
    - ./observability/logstash/pipeline:/usr/share/logstash/pipeline:ro
    - ./observability/logstash/config:/usr/share/logstash/config:ro
    - ./observability/logstash/patterns:/usr/share/logstash/patterns_custom:ro
  environment:
    - "LS_GROK_PATTERNS_DIR=/usr/share/logstash/patterns:/usr/share/logstash/patterns_custom"
