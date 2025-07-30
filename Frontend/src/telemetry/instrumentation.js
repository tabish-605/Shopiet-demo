/**
 * OpenTelemetry Instrumentation for React Frontend
 * This file should be placed in Frontend/src/telemetry/instrumentation.js
 */

import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { Resource } from '@opentelemetry/resources';
import { SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-web';
import { OTLPTraceExporter } from '@opentelemetry/exporter-otlp-http';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import { CompositePropagator, W3CBaggagePropagator, W3CTraceContextPropagator } from '@opentelemetry/core';

// Custom session ID processor
class SessionIdProcessor {
  constructor() {
    this.sessionId = this.generateSessionId();
  }

  generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  onStart(span) {
    span.setAttributes({
      'session.id': this.sessionId,
      'user.session.start_time': new Date().toISOString(),
      'shopiet.frontend.version': import.meta.env.VITE_APP_VERSION || '1.0.0',
      'shopiet.component': 'frontend'
    });
  }

  onEnd() {
    // Nothing to do on end
  }

  shutdown() {
    return Promise.resolve();
  }

  forceFlush() {
    return Promise.resolve();
  }
}

// Custom business metrics processor
class BusinessMetricsProcessor {
  onStart(span, parentContext) {
    const spanName = span.name;
    
    // Add business context based on span type
    if (spanName.includes('fetch') || spanName.includes('XMLHttpRequest')) {
      span.setAttributes({
        'shopiet.operation_type': 'api_call',
        'shopiet.component': 'frontend'
      });
    } else if (spanName.includes('user-interaction')) {
      span.setAttributes({
        'shopiet.operation_type': 'user_interaction',
        'shopiet.component': 'frontend'
      });
    } else if (spanName.includes('navigation')) {
      span.setAttributes({
        'shopiet.operation_type': 'navigation',
        'shopiet.component': 'frontend'
      });
    }

    // Add page context
    if (typeof window !== 'undefined') {
      span.setAttributes({
        'page.url': window.location.href,
        'page.path': window.location.pathname,
        'page.referrer': document.referrer,
        'user_agent': navigator.userAgent,
        'viewport.width': window.innerWidth,
        'viewport.height': window.innerHeight
      });
    }
  }

  onEnd() {
    // Nothing to do on end
  }

  shutdown() {
    return Promise.resolve();
  }

  forceFlush() {
    return Promise.resolve();
  }
}

// Custom resource detection
function createResource() {
  const resource = new Resource({
    [SEMRESATTRS_SERVICE_NAME]: 'shopiet-frontend',
    [SEMRESATTRS_SERVICE_VERSION]: import.meta.env.VITE_APP_VERSION || '1.0.0',
    'deployment.environment': import.meta.env.VITE_ENVIRONMENT || 'development',
    'service.namespace': 'shopiet',
    'shopiet.component': 'frontend',
    'shopiet.framework': 'react',
    'shopiet.build_tool': 'vite'
  });

  return resource;
}

// Initialize OpenTelemetry
export function initializeOpenTelemetry() {
  try {
    console.log('Initializing OpenTelemetry for React frontend...');

    const resource = createResource();

    // Create tracer provider
    const provider = new WebTracerProvider({
      resource: resource,
    });

    // Configure OTLP exporter
    const otlpEndpoint = import.meta.env.VITE_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || 
                        'http://localhost:4318/v1/traces';

    const exporter = new OTLPTraceExporter({
      url: otlpEndpoint,
      headers: {},
    });

    // Add span processors
    provider.addSpanProcessor(new SessionIdProcessor());
    provider.addSpanProcessor(new BusinessMetricsProcessor());
    provider.addSpanProcessor(
      new BatchSpanProcessor(exporter, {
        maxQueueSize: 100,
        scheduledDelayMillis: 500,
        exportTimeoutMillis: 30000,
        maxExportBatchSize: 10,
      })
    );

    // Register the provider
    provider.register({
      contextManager: new ZoneContextManager(),
      propagator: new CompositePropagator({
        propagators: [
          new W3CTraceContextPropagator(),
          new W3CBaggagePropagator(),
        ],
      }),
    });

    // Register auto-instrumentations
    registerInstrumentations({
      tracerProvider: provider,
      instrumentations: [
        getWebAutoInstrumentations({
          // Configure fetch instrumentation
          '@opentelemetry/instrumentation-fetch': {
            propagateTraceHeaderCorsUrls: [/.*/],
            clearTimingResources: true,
            applyCustomAttributesOnSpan: (span, request, result) => {
              span.setAttributes({
                'http.request.method': request.method || 'GET',
                'http.url': request.url,
                'shopiet.api_call': request.url.includes('/api/'),
                'shopiet.request_type': 'fetch'
              });

              if (result instanceof Response) {
                span.setAttributes({
                  'http.response.status_code': result.status,
                  'http.response.status_text': result.statusText
                });
              }
            },
          },
          
          // Configure user interaction instrumentation
          '@opentelemetry/instrumentation-user-interaction': {
            eventNames: ['click', 'submit', 'keydown'],
            shouldPreventSpanCreation: (eventType, element, span) => {
              // Don't create spans for certain elements
              return element.tagName === 'INPUT' && element.type === 'password';
            },
          },

          // Configure document load instrumentation
          '@opentelemetry/instrumentation-document-load': {
            enabled: true,
          },

          // Configure XMLHttpRequest instrumentation
          '@opentelemetry/instrumentation-xml-http-request': {
            propagateTraceHeaderCorsUrls: [/.*/],
            clearTimingResources: true,
          },
        }),
      ],
    });

    console.log('OpenTelemetry initialized successfully');
    
    // Track initialization
    const tracer = provider.getTracer('shopiet-frontend-init');
    const span = tracer.startSpan('frontend_initialization');
    span.setAttributes({
      'initialization.timestamp': new Date().toISOString(),
      'initialization.success': true,
      'shopiet.component': 'frontend'
    });
    span.end();

    return provider;

  } catch (error) {
    console.error('Failed to initialize OpenTelemetry:', error);
    throw error;
  }
}

// Custom tracking functions for business events
export function trackPageView(pageName, userId = null) {
  try {
    const tracer = window.__OTEL_TRACER__ || trace.getTracer('shopiet-frontend');
    const span = tracer.startSpan('page_view');
    
    span.setAttributes({
      'page.name': pageName,
      'page.url': window.location.href,
      'page.path': window.location.pathname,
      'user.id': userId || 'anonymous',
      'shopiet.event_type': 'page_view',
      'timestamp': new Date().toISOString()
    });
    
    span.end();
  } catch (error) {
    console.warn('Failed to track page view:', error);
  }
}

export function trackUserInteraction(action, element, additionalData = {}) {
  try {
    const tracer = window.__OTEL_TRACER__ || trace.getTracer('shopiet-frontend');
    const span = tracer.startSpan('user_interaction');
    
    span.setAttributes({
      'user.action': action,
      'interaction.element': element,
      'shopiet.event_type': 'user_interaction',
      'timestamp': new Date().toISOString(),
      ...additionalData
    });
    
    span.end();
  } catch (error) {
    console.warn('Failed to track user interaction:', error);
  }
}

export function trackBusinessEvent(eventType, eventData = {}) {
  try {
    const tracer = window.__OTEL_TRACER__ || trace.getTracer('shopiet-frontend');
    const span = tracer.startSpan(`business_event_${eventType}`);
    
    span.setAttributes({
      'shopiet.event_type': eventType,
      'shopiet.component': 'frontend',
      'timestamp': new Date().toISOString(),
      ...eventData
    });
    
    span.end();
  } catch (error) {
    console.warn('Failed to track business event:', error);
  }
}

export function trackError(error, context = {}) {
  try {
    const tracer = window.__OTEL_TRACER__ || trace.getTracer('shopiet-frontend');
    const span = tracer.startSpan('error_event');
    
    span.setAttributes({
      'error.name': error.name,
      'error.message': error.message,
      'error.stack': error.stack,
      'shopiet.event_type': 'error',
      'shopiet.component': 'frontend',
      'timestamp': new Date().toISOString(),
      ...context
    });
    
    span.recordException(error);
    span.end();
  } catch (trackingError) {
    console.warn('Failed to track error:', trackingError);
  }
}

export function trackPerformanceMetric(metricName, value, unit = 'ms', labels = {}) {
  try {
    const tracer = window.__OTEL_TRACER__ || trace.getTracer('shopiet-frontend');
    const span = tracer.startSpan('performance_metric');
    
    span.setAttributes({
      'metric.name': metricName,
      'metric.value': value,
      'metric.unit': unit,
      'shopiet.event_type': 'performance',
      'shopiet.component': 'frontend',
      'timestamp': new Date().toISOString(),
      ...labels
    });
    
    span.end();
  } catch (error) {
    console.warn('Failed to track performance metric:', error);
  }
}

// Performance observer for Core Web Vitals
export function initializePerformanceTracking() {
  if (typeof window === 'undefined' || !window.PerformanceObserver) {
    return;
  }

  try {
    // Largest Contentful Paint
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      trackPerformanceMetric('largest_contentful_paint', lastEntry.startTime, 'ms', {
        'element': lastEntry.element?.tagName || 'unknown'
      });
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        trackPerformanceMetric('first_input_delay', entry.processingStart - entry.startTime, 'ms', {
          'event_type': entry.name
        });
      });
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    let cumulativeLayoutShift = 0;
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          cumulativeLayoutShift += entry.value;
        }
      });
      trackPerformanceMetric('cumulative_layout_shift', cumulativeLayoutShift, 'score');
    }).observe({ entryTypes: ['layout-shift'] });

    console.log('Performance tracking initialized');
  } catch (error) {
    console.warn('Failed to initialize performance tracking:', error);
  }
}

// Global error handler
window.addEventListener('error', (event) => {
  trackError(event.error, {
    'error.filename': event.filename,
    'error.lineno': event.lineno,
    'error.colno': event.colno,
    'error.type': 'javascript_error'
  });
});

window.addEventListener('unhandledrejection', (event) => {
  trackError(new Error(event.reason), {
    'error.type': 'unhandled_promise_rejection'
  });
});

export default {
  initializeOpenTelemetry,
  trackPageView,
  trackUserInteraction,
  trackBusinessEvent,
  trackError,
  trackPerformanceMetric,
  initializePerformanceTracking
};
