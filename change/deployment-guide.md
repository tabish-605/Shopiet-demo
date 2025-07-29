# Shopiet E-commerce Observability Deployment Guide

This comprehensive guide walks you through implementing end-to-end observability for the Shopiet e-commerce application using AWS Distro for OpenTelemetry (ADOT).

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [File Deployment](#file-deployment)
4. [AWS Configuration](#aws-configuration)
5. [Service Deployment](#service-deployment)
6. [Verification](#verification)
7. [Monitoring and Dashboards](#monitoring-and-dashboards)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- Docker and Docker Compose v2.0+
- Node.js 18+ and npm/yarn
- Python 3.8+
- Git
- At least 8GB RAM and 20GB disk space

### AWS Requirements
- AWS Account with appropriate permissions
- AWS CLI configured
- IAM roles for:
  - CloudWatch (metrics and logs)
  - X-Ray (tracing)
  - Managed Prometheus (optional)

### Required AWS Policies
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "xray:PutTraceSegments",
                "xray:PutTelemetryRecords",
                "cloudwatch:PutMetricData",
                "logs:PutLogEvents",
                "logs:CreateLogGroup",
                "logs:CreateLogStream"
            ],
            "Resource": "*"
        }
    ]
}
```

## Initial Setup

### 1. Clone and Backup Original Files
```bash
# Navigate to your Shopiet project
cd /path/to/shopiet-demo

# Create backup of original files
mkdir -p backups
cp Backend\(Docked\)/requirements.txt backups/
cp Backend\(Docked\)/backend/settings.py backups/
cp Backend\(Docked\)/manage.py backups/
cp Backend\(Docked\)/api/views.py backups/
cp Frontend/package.json backups/
cp docker-compose.yml backups/
```

### 2. Create Required Directories
```bash
# Create observability directories
mkdir -p observability/{prometheus,grafana/{provisioning,dashboards},logstash/{pipeline,config},nginx}
mkdir -p Backend\(Docked\)/logs
mkdir -p Frontend/src/telemetry
```

## File Deployment

### 1. Backend Files

**Replace requirements.txt:**
```bash
cp updated-requirements.txt Backend\(Docked\)/requirements.txt
```

**Replace settings.py:**
```bash
cp updated-settings.py Backend\(Docked\)/backend/settings.py
```

**Add OpenTelemetry instrumentation:**
```bash
cp otel_instrumentation.py Backend\(Docked\)/backend/
cp custom_metrics.py Backend\(Docked\)/backend/
```

**Replace manage.py:**
```bash
cp updated-manage.py Backend\(Docked\)/manage.py
```

**Replace API views:**
```bash
cp updated-api-views.py Backend\(Docked\)/api/views.py
```

### 2. Frontend Files

**Replace package.json:**
```bash
cp updated-frontend-package.json Frontend/package.json
```

**Add OpenTelemetry instrumentation:**
```bash
cp react-instrumentation.js Frontend/src/telemetry/instrumentation.js
```

**Update main.jsx to initialize OpenTelemetry:**
```javascript
// Add this to the top of Frontend/src/main.jsx
import { initializeOpenTelemetry, initializePerformanceTracking } from './telemetry/instrumentation.js';

// Initialize OpenTelemetry before React
try {
  initializeOpenTelemetry();
  initializePerformanceTracking();
} catch (error) {
  console.warn('Failed to initialize OpenTelemetry:', error);
}
```

### 3. Infrastructure Files

**Copy Docker Compose and configuration:**
```bash
cp docker-compose-observability.yml docker-compose.yml
cp adot-collector-config.yaml ./
cp .env-observability .env
```

## AWS Configuration

### 1. Create AWS Resources

**Create CloudWatch Log Group:**
```bash
aws logs create-log-group --log-group-name "/aws/shopiet/backend" --region us-east-1
aws logs create-log-group --log-group-name "/aws/shopiet/frontend" --region us-east-1
```

**Create Managed Prometheus Workspace (Optional):**
```bash
aws amp create-workspace --alias shopiet-metrics --region us-east-1
```

### 2. Update Environment Variables

Edit the `.env` file with your actual AWS credentials:
```bash
# Replace these with your actual values
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_REGION=us-east-1

# If using Managed Prometheus, update this:
PROMETHEUS_REMOTE_WRITE_ENDPOINT=https://aps-workspaces.us-east-1.amazonaws.com/workspaces/ws-xxxxxxxx/api/v1/remote_write
```

## Service Deployment

### 1. Build and Start Services

**Build the application:**
```bash
# Install backend dependencies
cd Backend\(Docked\)
pip install -r requirements.txt

# Install frontend dependencies
cd ../Frontend
npm install

# Return to project root
cd ..
```

**Start all services:**
```bash
docker-compose up --build -d
```

### 2. Verify Service Health

**Check service status:**
```bash
docker-compose ps
```

**Verify ADOT Collector health:**
```bash
curl http://localhost:13133/
```

**Check backend health:**
```bash
curl http://localhost:8000/health/
```

**Verify frontend:**
```bash
curl http://localhost:3000/
```

## Verification

### 1. Test Data Flow

**Generate test traffic:**
```bash
# Test API endpoints
curl http://localhost:8000/api/
curl http://localhost:8000/api/signup/ -X POST -H "Content-Type: application/json" -d '{"username":"testuser","email":"test@example.com","password":"testpass123","password2":"testpass123"}'

# Test frontend interactions
# Visit http://localhost:3000 and perform actions like:
# - Browse items
# - Search for products
# - Register/login
# - Save items
```

### 2. Verify Observability Data

**Check metrics:**
```bash
# Prometheus metrics from Django
curl http://localhost:8001/metrics

# ADOT Collector internal metrics
curl http://localhost:8888/metrics
```

**Verify traces in AWS X-Ray:**
- Go to AWS X-Ray Console
- Look for service map showing "shopiet-backend"
- Verify traces are appearing

**Check CloudWatch:**
- Go to CloudWatch Console
- Verify metrics in "Shopiet/Application" namespace
- Check log groups "/aws/shopiet/backend"

## Monitoring and Dashboards

### 1. Access Monitoring Tools

**Local Development Tools:**
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (admin/admin)
- ADOT Collector zpages: http://localhost:55679
- Jaeger: http://localhost:16686
- Kibana: http://localhost:5601

**AWS Tools:**
- CloudWatch: AWS Console â†’ CloudWatch
- X-Ray: AWS Console â†’ X-Ray
- Managed Prometheus: AWS Console â†’ Amazon Managed Service for Prometheus

### 2. Import Dashboards

**Grafana Dashboards:**
```bash
# Copy dashboard configurations
cp -r observability/grafana/* ./observability/grafana/
docker-compose restart grafana
```

**Key Dashboards to Create:**
1. **Business Metrics Dashboard**
   - User registrations/logins
   - Item creation/views
   - Search operations
   - Message activity

2. **Application Performance Dashboard**
   - Request duration
   - Error rates
   - Database query performance
   - Cache hit ratios

3. **Infrastructure Dashboard**
   - CPU/Memory usage
   - Database connections
   - Redis operations
   - Container metrics

## Troubleshooting

### Common Issues and Solutions

**1. ADOT Collector not starting:**
```bash
# Check logs
docker-compose logs adot-collector

# Verify AWS credentials
docker-compose exec adot-collector env | grep AWS

# Check configuration syntax
docker-compose exec adot-collector /usr/bin/aws-otel-collector --config=/etc/otel-agent-config.yaml --dry-run
```

**2. No metrics in CloudWatch:**
```bash
# Verify IAM permissions
aws sts get-caller-identity

# Check ADOT Collector logs for export errors
docker-compose logs adot-collector | grep -i error

# Test manual metric submission
aws cloudwatch put-metric-data --namespace "Test" --metric-data MetricName=TestMetric,Value=1
```

**3. No traces in X-Ray:**
```bash
# Verify X-Ray service is accessible
aws xray get-service-graph --start-time 2024-01-01T00:00:00 --end-time 2024-01-02T00:00:00

# Check if spans are being generated
curl http://localhost:55679/debug/spans
```

**4. Django OpenTelemetry errors:**
```bash
# Check Python package installation
docker-compose exec backend pip list | grep opentelemetry

# Verify instrumentation initialization
docker-compose logs backend | grep -i "opentelemetry"

# Test manual span creation
docker-compose exec backend python -c "from opentelemetry import trace; print('OpenTelemetry working')"
```

**5. Frontend tracing not working:**
```bash
# Check browser developer console
# Network tab should show requests to /v1/traces

# Verify CORS configuration
curl -H "Origin: http://localhost:3000" http://localhost:4318/v1/traces -v
```

### Performance Optimization

**1. Adjust Sampling Rates:**
```bash
# For high-traffic environments, reduce sampling
TRACE_SAMPLING_RATE=0.1  # Sample 10% of traces
```

**2. Optimize Batch Sizes:**
```yaml
# In adot-collector-config.yaml
processors:
  batch:
    timeout: 5s
    send_batch_size: 512
    send_batch_max_size: 1024
```

**3. Resource Limits:**
```yaml
# In docker-compose.yml
services:
  adot-collector:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
```

### Monitoring Health

**Create Health Check Script:**
```bash
#!/bin/bash
# health-check.sh

echo "Checking Shopiet Observability Health..."

# Check core services
services=("db" "redis" "backend" "frontend" "adot-collector")
for service in "${services[@]}"; do
    if docker-compose ps $service | grep -q "Up"; then
        echo "âœ… $service is running"
    else
        echo "âŒ $service is not running"
    fi
done

# Check metrics endpoints
if curl -s http://localhost:8001/metrics > /dev/null; then
    echo "âœ… Django metrics endpoint is accessible"
else
    echo "âŒ Django metrics endpoint is not accessible"
fi

# Check ADOT Collector health
if curl -s http://localhost:13133/ > /dev/null; then
    echo "âœ… ADOT Collector is healthy"
else
    echo "âŒ ADOT Collector is not healthy"
fi

echo "Health check complete!"
```

### Log Analysis

**Common Log Patterns to Monitor:**
```bash
# Error patterns
docker-compose logs backend | grep -i "error\|exception\|traceback"

# OpenTelemetry issues
docker-compose logs | grep -i "opentelemetry\|otel\|trace\|span"

# Performance issues
docker-compose logs backend | grep -i "slow\|timeout\|memory"
```

## Security Considerations

1. **Sensitive Data:**
   - Configure `MASK_SENSITIVE_DATA=True`
   - Review trace attributes for PII
   - Use sampling for production

2. **AWS Credentials:**
   - Use IAM roles instead of access keys when possible
   - Rotate credentials regularly
   - Limit permissions to minimum required

3. **Network Security:**
   - Use HTTPS in production
   - Configure proper firewall rules
   - Enable authentication for monitoring tools

## Production Checklist

- [ ] AWS credentials configured with minimal permissions
- [ ] Sampling rates optimized for traffic volume
- [ ] Log retention policies configured
- [ ] Alerting rules set up
- [ ] Dashboards created and tested
- [ ] Resource limits configured
- [ ] Security policies reviewed
- [ ] Backup and recovery procedures tested
- [ ] Documentation updated
- [ ] Team trained on new observability tools

This completes the end-to-end observability implementation for your Shopiet e-commerce application using ADOT!