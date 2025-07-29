"""
Custom Metrics and Business Logic Monitoring for Shopiet Application
This file should be placed in Backend(Docked)/backend/custom_metrics.py
"""

import logging
import time
from typing import Dict, Any, Optional
from functools import wraps
from contextlib import contextmanager

from opentelemetry import trace, metrics
from opentelemetry.trace import Status, StatusCode
from opentelemetry.metrics import Counter, Histogram, UpDownCounter, Gauge
from django.db import models
from django.contrib.auth.models import User

logger = logging.getLogger(__name__)

# Get OpenTelemetry components
tracer = trace.get_tracer(__name__)
meter = metrics.get_meter(__name__)

# Business Metrics Instruments
class ShopietMetrics:
    """Custom metrics for Shopiet business operations"""
    
    def __init__(self):
        # HTTP Request metrics
        self.http_requests_total = meter.create_counter(
            name="shopiet_http_requests_total",
            description="Total number of HTTP requests",
            unit="1"
        )
        
        self.http_request_duration = meter.create_histogram(
            name="shopiet_http_request_duration_seconds",
            description="HTTP request duration in seconds",
            unit="s"
        )
        
        # User Activity metrics
        self.user_registrations_total = meter.create_counter(
            name="shopiet_user_registrations_total",
            description="Total number of user registrations",
            unit="1"
        )
        
        self.user_logins_total = meter.create_counter(
            name="shopiet_user_logins_total",
            description="Total number of user logins",
            unit="1"
        )
        
        self.active_users = meter.create_up_down_counter(
            name="shopiet_active_users",
            description="Number of currently active users",
            unit="1"
        )
        
        # Item/Product metrics
        self.items_created_total = meter.create_counter(
            name="shopiet_items_created_total",
            description="Total number of items created",
            unit="1"
        )
        
        self.items_viewed_total = meter.create_counter(
            name="shopiet_items_viewed_total",
            description="Total number of item views",
            unit="1"
        )
        
        self.items_saved_total = meter.create_counter(
            name="shopiet_items_saved_total",
            description="Total number of items saved by users",
            unit="1"
        )
        
        # Search metrics
        self.searches_total = meter.create_counter(
            name="shopiet_searches_total",
            description="Total number of searches performed",
            unit="1"
        )
        
        self.search_duration = meter.create_histogram(
            name="shopiet_search_duration_seconds",
            description="Search operation duration in seconds",
            unit="s"
        )
        
        # Message/Chat metrics
        self.messages_sent_total = meter.create_counter(
            name="shopiet_messages_sent_total",
            description="Total number of messages sent",
            unit="1"
        )
        
        self.active_conversations = meter.create_up_down_counter(
            name="shopiet_active_conversations",
            description="Number of active conversations",
            unit="1"
        )
        
        # Database metrics
        self.db_queries_total = meter.create_counter(
            name="shopiet_db_queries_total",
            description="Total number of database queries",
            unit="1"
        )
        
        self.db_query_duration = meter.create_histogram(
            name="shopiet_db_query_duration_seconds",
            description="Database query duration in seconds",
            unit="s"
        )
        
        # Redis/Cache metrics
        self.cache_operations_total = meter.create_counter(
            name="shopiet_cache_operations_total",
            description="Total number of cache operations",
            unit="1"
        )
        
        self.cache_hit_ratio = meter.create_histogram(
            name="shopiet_cache_hit_ratio",
            description="Cache hit ratio",
            unit="1"
        )
        
        # Business Logic metrics
        self.api_errors_total = meter.create_counter(
            name="shopiet_api_errors_total",
            description="Total number of API errors",
            unit="1"
        )
        
        self.authentication_attempts_total = meter.create_counter(
            name="shopiet_authentication_attempts_total",
            description="Total number of authentication attempts",
            unit="1"
        )
        
        # System metrics
        self.concurrent_requests = meter.create_up_down_counter(
            name="shopiet_concurrent_requests",
            description="Number of concurrent requests being processed",
            unit="1"
        )


# Global metrics instance
shopiet_metrics = ShopietMetrics()


def track_http_request(endpoint: str, method: str, user_id: Optional[str] = None):
    """Decorator to track HTTP request metrics"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            start_time = time.time()
            
            # Track concurrent requests
            shopiet_metrics.concurrent_requests.add(1, {
                "endpoint": endpoint,
                "method": method
            })
            
            try:
                # Execute the function
                result = kwargs.get('request', args[0] if args else None)
                response = func(*args, **kwargs)
                
                # Track successful request
                duration = time.time() - start_time
                attributes = {
                    "endpoint": endpoint,
                    "method": method,
                    "status_code": getattr(response, 'status_code', 200),
                    "success": "true"
                }
                
                if user_id:
                    attributes["user_id"] = user_id
                
                shopiet_metrics.http_requests_total.add(1, attributes)
                shopiet_metrics.http_request_duration.record(duration, attributes)
                
                return response
                
            except Exception as e:
                # Track failed request
                duration = time.time() - start_time
                attributes = {
                    "endpoint": endpoint,
                    "method": method,
                    "status_code": getattr(e, 'status_code', 500),
                    "success": "false",
                    "error_type": type(e).__name__
                }
                
                shopiet_metrics.http_requests_total.add(1, attributes)
                shopiet_metrics.http_request_duration.record(duration, attributes)
                shopiet_metrics.api_errors_total.add(1, attributes)
                
                raise
            
            finally:
                # Decrease concurrent requests counter
                shopiet_metrics.concurrent_requests.add(-1, {
                    "endpoint": endpoint,
                    "method": method
                })
        
        return wrapper
    return decorator


@contextmanager
def trace_business_operation(operation_name: str, **attributes):
    """Context manager for tracing business operations"""
    with tracer.start_as_current_span(operation_name) as span:
        # Add business attributes
        span.set_attribute("shopiet.operation", operation_name)
        for key, value in attributes.items():
            span.set_attribute(f"shopiet.{key}", str(value))
        
        try:
            yield span
            span.set_status(Status(StatusCode.OK))
        except Exception as e:
            span.set_status(Status(StatusCode.ERROR, str(e)))
            span.set_attribute("error.type", type(e).__name__)
            span.set_attribute("error.message", str(e))
            raise


def track_user_registration(user: User, registration_method: str = "web"):
    """Track user registration event"""
    with trace_business_operation(
        "user_registration",
        user_id=user.id,
        username=user.username,
        method=registration_method
    ):
        shopiet_metrics.user_registrations_total.add(1, {
            "method": registration_method,
            "success": "true"
        })
        
        logger.info(f"User registered: {user.username} via {registration_method}")


def track_user_login(user: User, success: bool = True, method: str = "web"):
    """Track user login event"""
    attributes = {
        "method": method,
        "success": str(success).lower()
    }
    
    if not success:
        attributes["failure_reason"] = "invalid_credentials"
    
    with trace_business_operation(
        "user_login",
        user_id=user.id if success else "anonymous",
        username=user.username if success else "unknown",
        method=method,
        success=success
    ):
        shopiet_metrics.user_logins_total.add(1, attributes)
        
        if success:
            shopiet_metrics.active_users.add(1, {"method": method})
            logger.info(f"User logged in: {user.username} via {method}")
        else:
            logger.warning(f"Failed login attempt for user: {getattr(user, 'username', 'unknown')}")


def track_item_creation(item_id: str, user_id: str, category: str):
    """Track item creation event"""
    with trace_business_operation(
        "item_creation",
        item_id=item_id,
        user_id=user_id,
        category=category
    ):
        shopiet_metrics.items_created_total.add(1, {
            "category": category,
            "user_type": "authenticated"
        })
        
        logger.info(f"Item created: {item_id} by user {user_id} in category {category}")


def track_item_view(item_id: str, user_id: Optional[str] = None, category: str = "unknown"):
    """Track item view event"""
    with trace_business_operation(
        "item_view",
        item_id=item_id,
        user_id=user_id or "anonymous",
        category=category
    ):
        shopiet_metrics.items_viewed_total.add(1, {
            "category": category,
            "user_type": "authenticated" if user_id else "anonymous"
        })


def track_item_save(item_id: str, user_id: str, action: str = "save"):
    """Track item save/unsave event"""
    with trace_business_operation(
        "item_save",
        item_id=item_id,
        user_id=user_id,
        action=action
    ):
        increment = 1 if action == "save" else -1
        shopiet_metrics.items_saved_total.add(increment, {
            "action": action,
            "user_type": "authenticated"
        })


def track_search_operation(query: str, user_id: Optional[str] = None, results_count: int = 0):
    """Track search operation"""
    start_time = time.time()
    
    with trace_business_operation(
        "search_operation",
        query=query[:50],  # Truncate long queries
        user_id=user_id or "anonymous",
        results_count=results_count
    ) as span:
        duration = time.time() - start_time
        
        attributes = {
            "user_type": "authenticated" if user_id else "anonymous",
            "has_results": "true" if results_count > 0 else "false"
        }
        
        shopiet_metrics.searches_total.add(1, attributes)
        shopiet_metrics.search_duration.record(duration, attributes)
        
        span.set_attribute("search.results_count", results_count)
        span.set_attribute("search.duration", duration)


def track_message_sent(sender_id: str, recipient_id: str, message_length: int):
    """Track message sending event"""
    with trace_business_operation(
        "message_sent",
        sender_id=sender_id,
        recipient_id=recipient_id,
        message_length=message_length
    ):
        shopiet_metrics.messages_sent_total.add(1, {
            "message_type": "direct",
            "user_type": "authenticated"
        })


def track_database_query(query_type: str, table: str, duration: float, success: bool = True):
    """Track database query performance"""
    attributes = {
        "query_type": query_type.lower(),
        "table": table,
        "success": str(success).lower()
    }
    
    shopiet_metrics.db_queries_total.add(1, attributes)
    shopiet_metrics.db_query_duration.record(duration, attributes)


def track_cache_operation(operation: str, key: str, hit: bool):
    """Track cache operation"""
    attributes = {
        "operation": operation.lower(),
        "hit": str(hit).lower()
    }
    
    shopiet_metrics.cache_operations_total.add(1, attributes)
    
    # Update cache hit ratio
    hit_value = 1.0 if hit else 0.0
    shopiet_metrics.cache_hit_ratio.record(hit_value, {"operation": operation.lower()})


def track_authentication_attempt(username: str, success: bool, method: str = "jwt"):
    """Track authentication attempts"""
    attributes = {
        "method": method,
        "success": str(success).lower()
    }
    
    if not success:
        attributes["failure_reason"] = "invalid_token"
    
    shopiet_metrics.authentication_attempts_total.add(1, attributes)


# Utility functions for custom span attributes
def add_business_context(span: trace.Span, context: Dict[str, Any]):
    """Add business context to a span"""
    for key, value in context.items():
        span.set_attribute(f"shopiet.{key}", str(value))


def track_api_performance(view_name: str):
    """Decorator for tracking API view performance"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            request = args[0] if args else None
            
            with tracer.start_as_current_span(f"api.{view_name}") as span:
                span.set_attribute("shopiet.api_view", view_name)
                span.set_attribute("shopiet.component", "api")
                
                if request:
                    span.set_attribute("http.method", request.method)
                    span.set_attribute("http.url", request.build_absolute_uri())
                    
                    if hasattr(request, 'user') and request.user.is_authenticated:
                        span.set_attribute("user.id", str(request.user.id))
                        span.set_attribute("user.authenticated", True)
                    else:
                        span.set_attribute("user.authenticated", False)
                
                try:
                    result = func(*args, **kwargs)
                    span.set_attribute("success", True)
                    return result
                except Exception as e:
                    span.set_attribute("success", False)
                    span.set_attribute("error.type", type(e).__name__)
                    span.set_attribute("error.message", str(e))
                    raise
        
        return wrapper
    return decorator


# Health check function
def get_metrics_health() -> Dict[str, Any]:
    """Get health status of metrics collection"""
    return {
        "metrics_enabled": True,
        "tracer_available": tracer is not None,
        "meter_available": meter is not None,
        "custom_metrics_initialized": shopiet_metrics is not None,
    }