# FinDashIQ Production Gunicorn Configuration
# Hardened WSGI configuration with multi-worker concurrency and automatic memory recycling

import os

# Enforce MALLOC_ARENA_MAX=2 on Linux to eliminate glibc multi-threaded memory fragmentation
if "MALLOC_ARENA_MAX" not in os.environ:
    os.environ["MALLOC_ARENA_MAX"] = "2"

import multiprocessing

# Network Binding
bind = os.environ.get("GUNICORN_BIND", "0.0.0.0:5000")

# Concurrency & Worker Model
# Default to min(2, CPU cores) for lean server RAM footprint with multi-threaded concurrency
workers = int(os.environ.get("GUNICORN_WORKERS", min(2, max(1, multiprocessing.cpu_count()))))
threads = int(os.environ.get("GUNICORN_THREADS", "4"))
worker_class = "gthread"

# Memory Management & Worker Lifecycle
# Automatically recycle worker processes after handling requests to completely flush
# any C-heap fragmentation (Pandas/NumPy/yfinance) and return memory to OS kernel.
max_requests = int(os.environ.get("GUNICORN_MAX_REQUESTS", "250"))
max_requests_jitter = int(os.environ.get("GUNICORN_MAX_REQUESTS_JITTER", "50"))

# Shared Memory for heartbeat to avoid disk I/O lockup on Linux
if os.path.exists("/dev/shm"):
    worker_tmp_dir = "/dev/shm"

# Timeouts & Keep-Alive
timeout = int(os.environ.get("GUNICORN_TIMEOUT", "120"))
keepalive = int(os.environ.get("GUNICORN_KEEPALIVE", "5"))
graceful_timeout = 30

# Logging
accesslog = "-"
errorlog = "-"
loglevel = os.environ.get("GUNICORN_LOG_LEVEL", "info")

# Process Naming & Safety
proc_name = "findashiq_server"
preload_app = False


def post_request(worker, req, environ, resp):
    """Periodic memory trim hook: releases unmapped C-heap pages back to the OS kernel every 25 requests."""
    count = getattr(worker, '_request_counter', 0) + 1
    worker._request_counter = count
    if count % 25 == 0:
        try:
            from services.cache_utils import collect_garbage
            collect_garbage("GunicornPostRequest")
        except Exception:
            pass

