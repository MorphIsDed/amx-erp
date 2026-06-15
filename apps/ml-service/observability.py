import time
import os
from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
from fastapi import Request, Response
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

# Initialize OpenTelemetry Tracer
provider = TracerProvider()
otlp_endpoint = os.getenv("OTEL_EXPORTER_OTLP_TRACES_ENDPOINT", "http://localhost:4318/v1/traces")
processor = BatchSpanProcessor(OTLPSpanExporter(endpoint=otlp_endpoint))
provider.add_span_processor(processor)
trace.set_tracer_provider(provider)

# Custom Prometheus Metrics
PREDICTION_COUNT = Counter("ml_predictions_total", "Total count of ML model predictions", ["sku", "status"])
ACCURACY_MAPE = Gauge("ml_model_accuracy_mape", "Mean Absolute Percentage Error (MAPE) of trained model", ["sku"])
RETRAIN_DURATION = Histogram("ml_model_retrain_duration_seconds", "Duration of model training in seconds")
FAILURES_COUNT = Counter("ml_failures_total", "Total count of forecasting errors")

def setup_observability(app):
    # Instrument FastAPI with OTel
    FastAPIInstrumentor.instrument_app(app)

    @app.middleware("http")
    async def metrics_middleware(request: Request, call_next):
        # Expose Prometheus scrapable endpoint directly
        if request.url.path == "/metrics":
            return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)
            
        try:
            response = await call_next(request)
            return response
        except Exception as e:
            FAILURES_COUNT.inc()
            raise e
