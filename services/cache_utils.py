import collections
import gc
import json
import logging
import os
import sys
import threading
import time
import weakref
from typing import Any, Callable, Iterator, Optional

# Enforce MALLOC_ARENA_MAX=2 on Linux to eliminate glibc multi-threaded heap fragmentation
if "MALLOC_ARENA_MAX" not in os.environ:
    os.environ["MALLOC_ARENA_MAX"] = "2"

logger = logging.getLogger('FinDashIQ')

_yf_session = None
_yf_session_lock = threading.Lock()


def get_yf_session():
    """
    Returns a shared, thread-safe session for yfinance requests.
    Prevents creating and abandoning unclosed native curl_cffi / libcurl sessions on every query.
    """
    global _yf_session
    with _yf_session_lock:
        if _yf_session is None:
            try:
                from yfinance._http import new_session
                _yf_session = new_session()
            except Exception as e:
                logger.debug(f"[CacheUtils] Failed to create yfinance session: {e}")
                _yf_session = None
        return _yf_session


def close_yf_session() -> None:
    """
    Explicitly closes the shared yfinance session and releases all underlying
    libcurl handles, sockets, and native memory back to the OS.
    """
    global _yf_session
    with _yf_session_lock:
        if _yf_session is not None:
            try:
                _yf_session.close()
            except Exception:
                pass
            _yf_session = None


def prune_expired_disk_cache(data_dir: Optional[str] = None) -> dict[str, int]:
    """
    Scans data/cache/ai/ and data/cache/news/ directories and unlinks expired .json cache files.
    Reclaims OS filesystem dentries/inodes and prevents kernel buffer/page cache bloat.
    """
    if not data_dir:
        data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data')

    now = time.time()
    pruned_counts = {"ai": 0, "news": 0}

    # 1. Prune expired AI responses (default TTL 14400s / 4 hours)
    ai_dir = os.path.join(data_dir, 'cache', 'ai')
    if os.path.exists(ai_dir):
        try:
            for fname in os.listdir(ai_dir):
                if fname.endswith('.json'):
                    fpath = os.path.join(ai_dir, fname)
                    try:
                        with open(fpath, 'r', encoding='utf-8') as fh:
                            entry = json.load(fh)
                        if entry.get('expires_at', 0) < now:
                            os.remove(fpath)
                            pruned_counts["ai"] += 1
                    except Exception:
                        pass
        except Exception as e:
            logger.debug(f"[CacheUtils] AI disk cache prune warning: {e}")

    # 2. Prune expired News cache files (older than 3600s / 1 hour)
    news_dir = os.path.join(data_dir, 'cache', 'news')
    if os.path.exists(news_dir):
        try:
            for fname in os.listdir(news_dir):
                if fname.endswith('.json'):
                    fpath = os.path.join(news_dir, fname)
                    try:
                        with open(fpath, 'r', encoding='utf-8') as fh:
                            entry = json.load(fh)
                        ts = entry.get('timestamp', 0)
                        if (now - ts > 3600) or (now - os.path.getmtime(fpath) > 3600):
                            os.remove(fpath)
                            pruned_counts["news"] += 1
                    except Exception:
                        pass
        except Exception as e:
            logger.debug(f"[CacheUtils] News disk cache prune warning: {e}")

    total_pruned = pruned_counts["ai"] + pruned_counts["news"]
    if total_pruned > 0:
        logger.info(f"[CacheUtils] Disk cache cleanup: removed {pruned_counts['ai']} expired AI files and {pruned_counts['news']} expired news files.")
    return pruned_counts


class CacheRegistry:
    """
    Central registry for in-memory caches across all services.
    Enables unified cache purging, sweeping, and memory introspection.
    Operates an autonomous background MemorySweeperDaemon running every 5 minutes.
    """
    _caches: set[weakref.ref] = set()
    _lock = threading.Lock()
    _sweeper_thread: Optional[threading.Thread] = None
    _stop_sweeper = threading.Event()
    _sweeper_started = False

    @classmethod
    def register(cls, cache_instance: 'BoundedTTLCache') -> None:
        with cls._lock:
            cls._caches.add(weakref.ref(cache_instance))
        cls.ensure_sweeper_running()

    @classmethod
    def ensure_sweeper_running(cls, interval_seconds: int = 300) -> None:
        """Starts the autonomous memory sweeper background daemon thread if not active."""
        with cls._lock:
            if cls._sweeper_thread is None or not cls._sweeper_thread.is_alive():
                cls._stop_sweeper.clear()
                cls._sweeper_thread = threading.Thread(
                    target=cls._sweeper_loop,
                    args=(interval_seconds,),
                    daemon=True,
                    name="MemorySweeperDaemon"
                )
                cls._sweeper_thread.start()
                cls._sweeper_started = True

    @classmethod
    def _sweeper_loop(cls, interval_seconds: int) -> None:
        """Periodic background sweeper: purges expired entries, cleans dead disk files, runs GC, and trims OS working set every 5 mins."""
        while not cls._stop_sweeper.is_set():
            # Sleep in small slices for graceful shutdown
            for _ in range(max(1, interval_seconds // 5)):
                if cls._stop_sweeper.is_set():
                    return
                time.sleep(5)

            try:
                purged_map = cls.purge_all()
                disk_pruned = prune_expired_disk_cache()
                reclaimed = collect_garbage("MemorySweeperDaemon")
                total_purged = sum(purged_map.values()) if purged_map else 0
                total_disk_pruned = sum(disk_pruned.values()) if disk_pruned else 0
                if total_purged > 0 or total_disk_pruned > 0 or reclaimed > 50:
                    logger.info(f"[MemorySweeperDaemon] Autonomous 5m sweep complete: purged {total_purged} RAM entries, removed {total_disk_pruned} expired disk files, reclaimed {reclaimed} objects.")
            except Exception as e:
                logger.debug(f"[MemorySweeperDaemon] Sweep iteration warning: {e}")

    @classmethod
    def purge_all(cls) -> dict[str, int]:
        """Sweeps and purges expired entries across all active registered caches."""
        results = {}
        with cls._lock:
            alive_caches = set()
            for c_ref in cls._caches:
                c = c_ref()
                if c is not None:
                    alive_caches.add(c_ref)
                    try:
                        purged = c.purge_expired()
                        results[c.name] = purged
                    except Exception as e:
                        logger.debug(f"[CacheRegistry] Purge error on {getattr(c, 'name', 'Cache')}: {e}")
            cls._caches = alive_caches
        return results

    @classmethod
    def get_stats(cls) -> list[dict]:
        """Returns statistics for all registered in-memory caches."""
        stats = []
        with cls._lock:
            for c_ref in list(cls._caches):
                c = c_ref()
                if c is not None:
                    stats.append({
                        "name": c.name,
                        "size": len(c),
                        "max_size": c.max_size,
                        "default_ttl": c.default_ttl
                    })
        return stats


class BoundedTTLCache:
    """
    High-performance, thread-safe Least Recently Used (LRU) in-memory cache
    with automatic capacity bounding and Time-To-Live (TTL) expiration.
    
    Guarantees fixed RAM consumption by:
    1. Evicting the least-recently used items when capacity reaches `max_size`.
    2. Lazy evaluation: silently discarding expired items on lookup.
    3. Active sweeping: supporting `purge_expired()` for periodic background memory cleanup.
    4. Auto-registering with CacheRegistry for system-wide memory management.
    """

    def __init__(self, max_size: int = 60, default_ttl: float = 1800.0, name: str = "Cache"):
        self.max_size = max(1, max_size)
        self.default_ttl = float(default_ttl)
        self.name = name
        self._store: collections.OrderedDict[str, dict] = collections.OrderedDict()
        self._lock = threading.RLock()
        CacheRegistry.register(self)

    def get(self, key: str, default: Any = None) -> Any:
        """
        Retrieves an item if it exists and has not expired.
        Updates LRU access order on successful retrieval.
        """
        with self._lock:
            if key not in self._store:
                return default
            entry = self._store[key]
            now = time.time()
            if now > entry['expires_at']:
                del self._store[key]
                return default
            self._store.move_to_end(key)
            return entry['data']

    def get_entry(self, key: str) -> Optional[dict]:
        """
        Returns the raw entry envelope {'timestamp': float, 'data': Any, 'expires_at': float}
        if not expired, refreshing LRU position.
        """
        with self._lock:
            if key not in self._store:
                return None
            entry = self._store[key]
            now = time.time()
            if now > entry['expires_at']:
                del self._store[key]
                return None
            self._store.move_to_end(key)
            return entry

    def set(self, key: str, value: Any, ttl: Optional[float] = None) -> None:
        """
        Stores an item with a given TTL. Evicts the oldest entry if max_size is exceeded.
        """
        ttl_seconds = self.default_ttl if ttl is None else float(ttl)
        now = time.time()
        expires_at = now + ttl_seconds
        
        with self._lock:
            # Inline lazy prune if store is near capacity
            if len(self._store) >= self.max_size:
                expired = [k for k, v in self._store.items() if now > v['expires_at']]
                for k in expired:
                    del self._store[k]

            if key in self._store:
                self._store.move_to_end(key)
            self._store[key] = {
                'timestamp': now,
                'expires_at': expires_at,
                'data': value
            }
            # Evict least recently used if still over capacity
            while len(self._store) > self.max_size:
                evicted_key, _ = self._store.popitem(last=False)
                logger.debug(f"[{self.name}] LRU capacity reached ({self.max_size}). Evicted oldest key: {evicted_key}")

    def purge_expired(self) -> int:
        """
        Actively sweeps and discards all expired items from the cache.
        Returns the number of purged items.
        """
        now = time.time()
        purged = 0
        with self._lock:
            expired_keys = [k for k, v in self._store.items() if now > v['expires_at']]
            for k in expired_keys:
                del self._store[k]
                purged += 1
        if purged > 0:
            logger.info(f"[{self.name}] Sweeper purged {purged} expired entries. Remaining active: {len(self._store)}")
        return purged

    def delete(self, key: str) -> bool:
        """Removes a specific key from the cache."""
        with self._lock:
            if key in self._store:
                del self._store[key]
                return True
            return False

    def clear(self) -> None:
        """Empties the cache."""
        with self._lock:
            self._store.clear()

    def __contains__(self, key: str) -> bool:
        return self.get(key) is not None

    def __getitem__(self, key: str) -> Any:
        val = self.get(key)
        if val is None:
            raise KeyError(key)
        return val

    def __setitem__(self, key: str, value: Any) -> None:
        self.set(key, value)

    def __delitem__(self, key: str) -> None:
        with self._lock:
            del self._store[key]

    def __len__(self) -> int:
        with self._lock:
            return len(self._store)

    def items(self) -> list[tuple[str, Any]]:
        with self._lock:
            now = time.time()
            return [(k, v['data']) for k, v in self._store.items() if now <= v['expires_at']]

    def keys(self) -> list[str]:
        with self._lock:
            now = time.time()
            return [k for k, v in self._store.items() if now <= v['expires_at']]


class ProcessLock:
    """
    Cross-platform, non-blocking file-based process lock.
    Ensures that only ONE worker process across Gunicorn / multi-process deployments
    executes background jobs (scans, warmups, data syncs) at any given time.
    """

    def __init__(self, lock_name: str):
        data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data')
        os.makedirs(data_dir, exist_ok=True)
        self.lock_file = os.path.join(data_dir, f"{lock_name}.lock")
        self._fd = None
        self._acquired = False

    def acquire(self) -> bool:
        """Attempts to acquire the lock non-blockingly. Returns True if acquired, False otherwise."""
        if self._acquired:
            return True
        try:
            if sys.platform == 'win32':
                import msvcrt
                self._fd = open(self.lock_file, 'a+')
                try:
                    self._fd.seek(0)
                    msvcrt.locking(self._fd.fileno(), msvcrt.LK_NBLCK, 1)
                    self._acquired = True
                    return True
                except (IOError, OSError):
                    try:
                        self._fd.close()
                    except Exception:
                        pass
                    self._fd = None
                    self._acquired = False
                    return False
            else:
                import fcntl
                self._fd = open(self.lock_file, 'a+')
                try:
                    fcntl.flock(self._fd.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
                    self._acquired = True
                    return True
                except (IOError, OSError):
                    try:
                        self._fd.close()
                    except Exception:
                        pass
                    self._fd = None
                    self._acquired = False
                    return False
        except Exception as e:
            logger.debug(f"[ProcessLock] Lock {self.lock_file} acquire exception: {e}")
            self._acquired = False
            return False

    def release(self) -> None:
        """Releases the lock."""
        if not self._acquired or not self._fd:
            return
        try:
            if sys.platform == 'win32':
                import msvcrt
                try:
                    self._fd.seek(0)
                    msvcrt.locking(self._fd.fileno(), msvcrt.LK_UNLCK, 1)
                except Exception:
                    pass
            else:
                import fcntl
                try:
                    fcntl.flock(self._fd.fileno(), fcntl.LOCK_UN)
                except Exception:
                    pass
            self._fd.close()
        except Exception:
            pass
        finally:
            self._fd = None
            self._acquired = False

    def is_locked(self) -> bool:
        """Checks if the lock is currently held by any process."""
        if self._acquired:
            return True
        acq = self.acquire()
        if acq:
            self.release()
            return False
        return True

    def __enter__(self):
        return self.acquire()

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.release()


def collect_garbage(log_prefix: str = "MemoryManager") -> int:
    """
    Explicitly invokes Python generational garbage collection AND releases committed
    C/OS memory pages back to the operating system (Windows MSVC CRT _heapmin and
    SetProcessWorkingSetSize, Linux glibc mallopt & malloc_trim).
    Also closes idle yfinance/curl_cffi sessions and clears internal library caches.
    """
    unreachable = 0
    try:
        # 1. Close persistent yfinance/curl_cffi sessions to free C libcurl handles & buffers
        close_yf_session()

        # 2. Clear modern yfinance in-memory LRU caches
        if 'yfinance' in sys.modules:
            try:
                import yfinance.data as yfd
                if hasattr(yfd, 'YfData') and hasattr(yfd.YfData, 'cache_get'):
                    yfd.YfData.cache_get.cache_clear()
                if hasattr(yfd, 'urlsplit') and hasattr(yfd.urlsplit, 'cache_clear'):
                    yfd.urlsplit.cache_clear()
            except Exception:
                pass
            try:
                import yfinance._http as yfh
                if hasattr(yfh, '_supported_session_classes') and hasattr(yfh._supported_session_classes, 'cache_clear'):
                    yfh._supported_session_classes.cache_clear()
            except Exception:
                pass

        # 3. Run full 3-generation collection
        unreachable = gc.collect(2)
        unreachable += gc.collect()

        # 4. OS-level memory trim to return physical pages back to operating system
        if sys.platform == 'win32':
            import ctypes
            try:
                # Release MSVC CRT heap allocations
                ctypes.cdll.msvcrt._heapmin()
            except Exception:
                pass
            try:
                # Trim process working set pages back to Windows kernel
                handle = ctypes.windll.kernel32.GetCurrentProcess()
                ctypes.windll.kernel32.SetProcessWorkingSetSize(handle, -1, -1)
            except Exception:
                pass
        elif sys.platform.startswith('linux'):
            import ctypes
            try:
                libc = ctypes.CDLL('libc.so.6')
                # M_ARENA_MAX = -8 in glibc mallopt: limit memory arenas to 2 to eliminate fragmentation
                try:
                    libc.mallopt(-8, 2)
                except Exception:
                    pass
                # Force glibc to return free arenas to OS kernel
                libc.malloc_trim(0)
            except Exception:
                pass

        if unreachable > 0:
            logger.debug(f"[{log_prefix}] Garbage collection completed: reclaimed {unreachable} unreachable objects and trimmed OS working set.")
        return unreachable
    except Exception as e:
        logger.warning(f"[{log_prefix}] Garbage collection warning: {e}")
        return unreachable

