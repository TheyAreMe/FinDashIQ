# FinDashIQ Production Gunicorn Configuration
# Hardened WSGI configuration with multi-worker concurrency and automatic memory recycling

import os
import sys

# Enforce MALLOC_ARENA_MAX=2 on Linux to eliminate glibc multi-threaded memory fragmentation
if "MALLOC_ARENA_MAX" not in os.environ:
    os.environ["MALLOC_ARENA_MAX"] = "2"

if sys.platform.startswith('linux'):
    try:
        import ctypes
        libc = ctypes.CDLL('libc.so.6')
        # M_ARENA_MAX = -8 in glibc mallopt: limit memory arenas to 2
        libc.mallopt(-8, 2)
        libc.malloc_trim(0)
    except Exception:
        pass

import multiprocessing

# Network Binding
bind = os.environ.get("GUNICORN_BIND", "0.0.0.0:5000")

# Concurrency & Worker Model
# Default to 2 workers with 4 threads (8 concurrent requests) for lean RAM footprint (<500MB total)
workers = int(os.environ.get("GUNICORN_WORKERS", min(2, max(1, multiprocessing.cpu_count()))))
threads = int(os.environ.get("GUNICORN_THREADS", "4"))
worker_class = "gthread"

# Memory Management & Worker Lifecycle
# Automatically recycle worker processes every 40-80 requests to completely flush
# any C-heap fragmentation (Pandas/NumPy/yfinance) and return memory to OS kernel.
max_requests = int(os.environ.get("GUNICORN_MAX_REQUESTS", "60"))
max_requests_jitter = int(os.environ.get("GUNICORN_MAX_REQUESTS_JITTER", "20"))
max_worker_memory_mb = int(os.environ.get("GUNICORN_MAX_WORKER_MEMORY_MB", "250"))

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


def _get_current_rss_mb() -> float:
    """Fast procfs memory inspection for current worker."""
    if sys.platform.startswith('linux'):
        try:
            with open('/proc/self/status', 'r', encoding='utf-8') as f:
                for line in f:
                    if line.startswith('VmRSS:'):
                        return round(int(line.split()[1]) / 1024.0, 1)
        except Exception:
            pass
    return 0.0


def post_request(worker, req, environ, resp):
    """
    Periodic memory trim & auto-recycling watchdog:
    1. Releases unmapped C-heap pages back to the OS kernel every 10 requests.
    2. Gracefully retires worker if RSS exceeds max_worker_memory_mb (250 MB).
    """
    count = getattr(worker, '_request_counter', 0) + 1
    worker._request_counter = count

    if count % 10 == 0:
        try:
            from services.cache_utils import collect_garbage
            collect_garbage("GunicornPostRequest")
        except Exception:
            pass

    # Memory watchdog: retire worker gracefully if RSS exceeds limit
    if count % 5 == 0:
        try:
            rss = _get_current_rss_mb()
            if rss > max_worker_memory_mb:
                import logging
                logging.getLogger('gunicorn.error').info(
                    f"[Gunicorn Memory Watchdog] Worker PID {os.getpid()} RSS ({rss:.1f} MB) exceeded limit ({max_worker_memory_mb} MB). Gracefully retiring worker."
                )
                worker.alive = False
        except Exception:
            pass
