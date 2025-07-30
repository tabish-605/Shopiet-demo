"""
OpenTelemetry Instrumentation for Shopiet Django Backend
This file should be placed in Backend(Docked)/backend/otel_instrumentation.py
"""

import os
import logging
from typing import Any, Dict, Optional

from opentelemetry import trace, metrics, _logs
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.sdk._logs import LoggerProvider
from opentelemetry.sdk._logs.export import BatchLogRecordProcessor

# Exporters
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.exporter.otlp.proto.http.metric_exporter import OTLPMetricExporter
from opentelemetry.exporter.otlp.proto.http._log_exporter import OTLPLogExporter

# Resource detection
from opentelemetry.sdk.resources import Resource, ResourceDetector
from opentelemetry.sdk.resources import SERVICE_NAME, SERVICE_VERSION
from opentelemetry.semconv.resource import ResourceAttributes

# Instrumentation
from opentelemetry.instrumentation.django import DjangoInstrumentor
from opentelemetry.instrumentation.psycopg2 import Psycopg2Instrumentor
from opentelemetry.instrumentation.redis import RedisInstrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor
from opentelemetry.instrumentation.urllib3 import URLLib3Instrumentor
from opentelemetry.instrumentation.logging import LoggingInstrumentor

# Prometheus exporter for metrics
from opentelemetry.exporter.prometheus import PrometheusMetricReader
from prometheus_client import start_http_server

# Sampling
from opentelemetry.sdk.trace.sampling import TraceIdRatioBased

# Propagators
from opentelemetry.propagate import set_global_textmap
from opentelemetry.propagators.b3 import B3MultiFormat
from opentelemetry.propagators.jaeger import JaegerPropagator
from opentelemetry.propagators.composite import CompositePropagator
from opentelemetry.trace.propagation.tracecontext import TraceContextTextMapPropagator

logger = logging.getLogger(__name__)


class ShopietResourceDetector(ResourceDetector):
    """Custom resource detector for Shopiet application"""
    
    def detect(self) -> Resource:
        return Resource.create({
            ResourceAttributes.SERVICE_NAME: os.getenv('OTEL_SERVICE_NAME', 'shopiet-backend'),
            ResourceAttributes.SERVICE_VERSION: os.getenv('OTEL_SERVICE_VERSION', '1.0.0'),
            ResourceAttributes.SERVICE_NAMESPACE: os.getenv('OTEL_SERVICE_NAMESPACE', 'shopiet'),
            ResourceAttributes.DEPLOYMENT_ENVIRONMENT: os.getenv('ENVIRONMENT', 'development'),
            ResourceAttributes.CONTAINER_NAME: os.getenv('HOSTNAME', 'unknown'),
            "shopiet.component": "backend",
            "shopiet.language": "python",
            "shopiet.framework": "django",
        })


def get_resource() -> Resource:
    """Create and return OpenTelemetry resource"""
    return Resource.create().merge(ShopietResourceDetector().detect())


def setup_tracing() -> None:
    """Configure OpenTelemetry tracing"""
    resource = get_resource()
    
    # Configure sampling
    sampling_rate = float(os.getenv('TRACE_SAMPLING_RATE', '1.0'))
    sampler = TraceIdRatioBased(sampling_rate)
    
    # Create tracer provider
    tracer_provider = TracerProvider(
        resource=resource,
        sampler=sampler
    )
    
    # Configure OTLP exporter
    otlp_endpoint = os.getenv('OTEL_EXPORTER_OTLP_TRACES_ENDPOINT', 
                              'http://adot-collector:4318/v1/traces')
    
    # Create and configure span processor
    span_processor = BatchSpanProcessor(
        OTLPSpanExporter(
            endpoint=otlp_endpoint,
            headers=_get_otlp_headers(),
        )
    )
    
    tracer_provider.add_span_processor(span_processor)
    
    # Set global tracer provider
    trace.set_tracer_provider(tracer_provider)
    
    logger.info(f"Tracing configured with endpoint: {otlp_endpoint}")


def setup_metrics() -> None:
    """Configure OpenTelemetry metrics"""
    resource = get_resource()
    
    # Configure OTLP metric exporter
    otlp_endpoint = os.getenv('OTEL_EXPORTER_OTLP_METRICS_ENDPOINT',
                              'http://adot-collector:4318/v1/metrics')
    
    otlp_reader = PeriodicExportingMetricReader(
        OTLPMetricExporter(
            endpoint=otlp_endpoint,
            headers=_get_otlp_headers(),
        ),
        export_interval_millis=int(os.getenv('METRICS_EXPORT_INTERVAL', '30000'))
    )
    
    # Configure Prometheus metric exporter (for local development)
    prometheus_port = int(os.getenv('PROMETHEUS_METRICS_EXPORT_PORT', '8001'))
    prometheus_reader = PrometheusMetricReader()
    
    # Create meter provider
    meter_provider = MeterProvider(
        resource=resource,
        metric_readers=[otlp_reader, prometheus_reader]
    )
    
    # Set global meter provider
    metrics.set_meter_provider(meter_provider)
    
    # Start Prometheus metrics server
    try:
        start_http_server(prometheus_port)
        logger.info(f"Prometheus metrics server started on port {prometheus_port}")
    except OSError as e:
        logger.warning(f"Could not start Prometheus metrics server: {e}")
    
    logger.info(f"Metrics configured with OTLP endpoint: {otlp_endpoint}")


def setup_logging() -> None:
    """Configure OpenTelemetry logging"""
    resource = get_resource()
    
    # Configure OTLP log exporter
    otlp_endpoint = os.getenv('OTEL_EXPORTER_OTLP_LOGS_ENDPOINT',
                              'http://adot-collector:4318/v1/logs')
    
    # Create logger provider
    logger_provider = LoggerProvider(resource=resource)
    
    # Create and configure log record processor
    log_processor = BatchLogRecordProcessor(
        OTLPLogExporter(
            endpoint=otlp_endpoint,
            headers=_get_otlp_headers(),
        )
    )
    
    logger_provider.add_log_record_processor(log_processor)
    
    # Set global logger provider
    _logs.set_logger_provider(logger_provider)
    
    logger.info(f"Logging configured with endpoint: {otlp_endpoint}")


def setup_propagators() -> None:
    """Configure trace context propagators"""
    propagator = CompositePropagator([
        TraceContextTextMapPropagator(),
        B3MultiFormat(),
        JaegerPropagator(),
    ])
    set_global_textmap(propagator)
    logger.info("Propagators configured")


def setup_auto_instrumentation() -> None:
    """Configure automatic instrumentation for Django and related libraries"""
    
    # Django instrumentation
    if not DjangoInstrumentor().is_instrumented_by_opentelemetry:
        DjangoInstrumentor().instrument(
            request_hook=_django_request_hook,
            response_hook=_django_response_hook,
            is_sql_commentor_enabled=True,
        )
        logger.info("Django instrumentation enabled")
    
    # PostgreSQL instrumentation
    if not Psycopg2Instrumentor().is_instrumented_by_opentelemetry:
        Psycopg2Instrumentor().instrument(
            enable_commenter=True,
            commenter_options={
                'db_driver': True,
                'db_framework': True,
                'opentelemetry_values': True,
            }
        )
        logger.info("PostgreSQL instrumentation enabled")
    
    # Redis instrumentation
    if not RedisInstrumentor().is_instrumented_by_opentelemetry:
        RedisInstrumentor().instrument(
            response_hook=_redis_response_hook,
        )
        logger.info("Redis instrumentation enabled")
    
    # HTTP requests instrumentation
    if not RequestsInstrumentor().is_instrumented_by_opentelemetry:
        RequestsInstrumentor().instrument()
        logger.info("Requests instrumentation enabled")
    
    if not URLLib3Instrumentor().is_instrumented_by_opentelemetry:
        URLLib3Instrumentor().instrument()
        logger.info("URLLib3 instrumentation enabled")
    
    # Logging instrumentation
    if not LoggingInstrumentor().is_instrumented_by_opentelemetry:
        LoggingInstrumentor().instrument(set_logging_format=True)
        logger.info("Logging instrumentation enabled")


def _get_otlp_headers() -> Dict[str, str]:
    """Get OTLP headers for authentication and configuration"""
    headers = {}
    
    # Add custom headers if needed
    if auth_header := os.getenv('OTEL_EXPORTER_OTLP_HEADERS'):
        for header in auth_header.split(','):
            if '=' in header:
                key, value = header.split('=', 1)
                headers[key.strip()] = value.strip()
    
    return headers


def _django_request_hook(span: Any, request: Any) -> None:
    """Custom hook to add request attributes to Django spans"""
    if not span or not request:
        return
    
    try:
        # Add custom request attributes
        span.set_attribute("http.request.path", request.path)
        span.set_attribute("http.request.method", request.method)
        
        if hasattr(request, 'user') and request.user.is_authenticated:
            span.set_attribute("user.id", str(request.user.id))
            span.set_attribute("user.username", request.user.username)
        
        # Add request headers if enabled
        if os.getenv('TRACE_REQUEST_HEADERS', 'True').lower() == 'true':
            for header, value in request.META.items():
                if header.startswith('HTTP_'):
                    header_name = header[5:].replace('_', '-').lower()
                    if header_name not in ['authorization', 'cookie', 'x-api-key']:
                        span.set_attribute(f"http.request.header.{header_name}", str(value))
        
        # Add business context
        if request.path.startswith('/api/'):
            span.set_attribute("shopiet.api_endpoint", True)
            if 'item' in request.path:
                span.set_attribute("shopiet.resource_type", "item")
            elif 'user' in request.path or 'profile' in request.path:
                span.set_attribute("shopiet.resource_type", "user")
            elif 'chat' in request.path or 'message' in request.path:
                span.set_attribute("shopiet.resource_type", "message")
    
    except Exception as e:
        logger.warning(f"Error in Django request hook: {e}")


def _django_response_hook(span: Any, request: Any, response: Any) -> None:
    """Custom hook to add response attributes to Django spans"""
    if not span or not response:
        return
    
    try:
        span.set_attribute("http.response.status_code", response.status_code)
        
        if response.status_code >= 400:
            span.set_attribute("error", True)
            span.set_attribute("error.type", "http_error")
        
        # Add response headers if enabled
        if os.getenv('TRACE_RESPONSE_HEADERS', 'False').lower() == 'true':
            for header, value in response.items():
                if header.lower() not in ['set-cookie', 'authorization']:
                    span.set_attribute(f"http.response.header.{header.lower()}", str(value))
    
    except Exception as e:
        logger.warning(f"Error in Django response hook: {e}")


def _redis_response_hook(span: Any, instance: Any, response: Any) -> None:
    """Custom hook to add Redis operation attributes"""
    if not span:
        return
    
    try:
        if hasattr(instance, 'connection_pool') and instance.connection_pool:
            connection_kwargs = instance.connection_pool.connection_kwargs
            span.set_attribute("redis.database_index", connection_kwargs.get('db', 0))
        
        # Add response size if available
        if response is not None:
            if isinstance(response, (str, bytes)):
                span.set_attribute("redis.response.size", len(response))
            elif isinstance(response, (list, tuple)):
                span.set_attribute("redis.response.count", len(response))
    
    except Exception as e:
        logger.warning(f"Error in Redis response hook: {e}")


def initialize_observability() -> None:
    """Initialize all OpenTelemetry components"""
    try:
        logger.info("Initializing OpenTelemetry observability...")
        
        # Setup core components
        setup_tracing()
        setup_metrics()
        setup_logging()
        setup_propagators()
        
        # Setup auto-instrumentation
        setup_auto_instrumentation()
        
        logger.info("OpenTelemetry observability initialized successfully")
        
    except Exception as e:
        logger.error(f"Failed to initialize OpenTelemetry: {e}")
        raise


def shutdown_observability() -> None:
    """Gracefully shutdown OpenTelemetry components"""
    try:
        logger.info("Shutting down OpenTelemetry observability...")
        
        # Shutdown tracer provider
        if tracer_provider := trace.get_tracer_provider():
            if hasattr(tracer_provider, 'shutdown'):
                tracer_provider.shutdown()
        
        # Shutdown meter provider
        if meter_provider := metrics.get_meter_provider():
            if hasattr(meter_provider, 'shutdown'):
                meter_provider.shutdown()
        
        # Shutdown logger provider
        if logger_provider := _logs.get_logger_provider():
            if hasattr(logger_provider, 'shutdown'):
                logger_provider.shutdown()
        
        logger.info("OpenTelemetry observability shut down successfully")
        
    except Exception as e:
        logger.error(f"Error shutting down OpenTelemetry: {e}")


# Create module-level tracers and meters for custom instrumentation
tracer = trace.get_tracer(__name__)
meter = metrics.get_meter(__name__)

# Export commonly used components
__all__ = [
    'initialize_observability',
    'shutdown_observability',
    'tracer',
    'meter',
]
