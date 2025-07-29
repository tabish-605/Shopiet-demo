#!/usr/bin/env python
"""
Django's command-line utility for administrative tasks with OpenTelemetry integration.
This file should replace Backend(Docked)/manage.py
"""
import os
import sys
import atexit
import logging

# Configure logging early
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    
    # Initialize OpenTelemetry before Django starts
    try:
        # Only initialize OpenTelemetry if it's enabled
        if os.getenv('ENABLE_OPENTELEMETRY', 'True').lower() == 'true':
            logger.info("Initializing OpenTelemetry...")
            
            # Import and initialize OpenTelemetry
            from backend.otel_instrumentation import initialize_observability, shutdown_observability
            initialize_observability()
            
            # Register shutdown handler
            atexit.register(shutdown_observability)
            
            logger.info("OpenTelemetry initialized successfully")
        else:
            logger.info("OpenTelemetry disabled via environment variable")
            
    except ImportError as e:
        logger.warning(f"OpenTelemetry not available: {e}")
    except Exception as e:
        logger.error(f"Failed to initialize OpenTelemetry: {e}")
        # Don't fail the application if observability fails
        pass
    
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()