import os
import re
import json
import time
from datetime import datetime
import requests

try:
    from packaging import version
except ImportError:
    class _VersionFallback:
        @staticmethod
        def parse(ver_str):
            parts = []
            for piece in re.findall(r'\d+', str(ver_str)):
                try:
                    parts.append(int(piece))
                except ValueError:
                    pass
            return tuple(parts) or (0, 0, 0)
    version = _VersionFallback()

APP_VERSION = "0.1.4"
GITHUB_REPO = "TheyAreMe/FinDashIQ"
CACHE_TTL_SECONDS = 3600  # 1 hour cache to respect GitHub API rate limits


def get_cache_path():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    cache_dir = os.path.join(base_dir, "data", "cache")
    os.makedirs(cache_dir, exist_ok=True)
    return os.path.join(cache_dir, "update_check.json")


def extract_semver(text):
    """
    Extracts semantic version string (e.g. '0.1.3' from 'v0.1.3' or 'FinDashIQ v0.1.3')
    """
    if not text:
        return None
    match = re.search(r'v?(\d+\.\d+(?:\.\d+)?)', str(text).strip())
    if match:
        return match.group(1)
    return None


class UpdateService:
    @staticmethod
    def get_current_version():
        return APP_VERSION

    @staticmethod
    def check_for_updates(force_refresh=False):
        """
        Checks GitHub Releases for updates comparing against APP_VERSION.
        Caches result for 1 hour unless force_refresh is True.
        """
        cache_path = get_cache_path()

        # Check existing cache if not forcing refresh
        if not force_refresh and os.path.exists(cache_path):
            try:
                with open(cache_path, "r", encoding="utf-8") as f:
                    cached_data = json.load(f)
                cached_time = cached_data.get("timestamp_epoch", 0)
                if (time.time() - cached_time) < CACHE_TTL_SECONDS:
                    cached_data["cached"] = True
                    # Re-verify update_available against current APP_VERSION
                    latest_ver_str = cached_data.get("latest_version")
                    if latest_ver_str:
                        try:
                            cached_data["update_available"] = version.parse(latest_ver_str) > version.parse(APP_VERSION)
                        except Exception:
                            cached_data["update_available"] = False
                    cached_data["current_version"] = APP_VERSION
                    return cached_data
            except Exception as e:
                pass  # Fall back to live fetch on cache read error

        # Live fetch from GitHub Releases API
        api_url = f"https://api.github.com/repos/{GITHUB_REPO}/releases"
        headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": f"FinDashIQ-Updater/{APP_VERSION}"
        }

        try:
            resp = requests.get(api_url, headers=headers, timeout=8)
            if resp.status_code == 403 and "rate limit" in resp.text.lower():
                # Rate limit encountered: if stale cache exists, return it with warning
                if os.path.exists(cache_path):
                    with open(cache_path, "r", encoding="utf-8") as f:
                        fallback_data = json.load(f)
                    fallback_data["rate_limited"] = True
                    fallback_data["cached"] = True
                    return fallback_data
                return {
                    "success": False,
                    "error": "GitHub API rate limit exceeded. Please try again in a few minutes.",
                    "current_version": APP_VERSION,
                    "update_available": False
                }

            resp.raise_for_status()
            releases = resp.json()

            if not isinstance(releases, list) or len(releases) == 0:
                result = {
                    "success": True,
                    "current_version": APP_VERSION,
                    "update_available": False,
                    "latest_version": APP_VERSION,
                    "latest_release_name": f"v{APP_VERSION}",
                    "latest_release_url": f"https://github.com/{GITHUB_REPO}/releases",
                    "latest_release_date": datetime.utcnow().isoformat(),
                    "latest_release_notes": "No public releases found on GitHub repository.",
                    "recent_releases": [],
                    "timestamp_epoch": time.time(),
                    "cached": False
                }
                with open(cache_path, "w", encoding="utf-8") as f:
                    json.dump(result, f, indent=2)
                return result

            parsed_releases = []
            for r in releases:
                if r.get("draft", False):
                    continue

                tag = r.get("tag_name", "")
                name = r.get("name", "")
                semver_candidate = extract_semver(name) or extract_semver(tag)

                if not semver_candidate:
                    continue

                try:
                    parsed_ver = version.parse(semver_candidate)
                except Exception:
                    continue

                parsed_releases.append({
                    "parsed_ver": parsed_ver,
                    "version_str": semver_candidate,
                    "tag_name": tag,
                    "name": name or f"v{semver_candidate}",
                    "html_url": r.get("html_url", f"https://github.com/{GITHUB_REPO}/releases"),
                    "published_at": r.get("published_at", ""),
                    "body": r.get("body", ""),
                    "prerelease": r.get("prerelease", False)
                })

            if not parsed_releases:
                return {
                    "success": True,
                    "current_version": APP_VERSION,
                    "update_available": False,
                    "latest_version": APP_VERSION,
                    "latest_release_name": f"v{APP_VERSION}",
                    "latest_release_url": f"https://github.com/{GITHUB_REPO}/releases",
                    "timestamp_epoch": time.time(),
                    "cached": False
                }

            # Sort descending by parsed semver
            parsed_releases.sort(key=lambda x: x["parsed_ver"], reverse=True)
            latest = parsed_releases[0]

            curr_v = version.parse(APP_VERSION)
            update_available = latest["parsed_ver"] > curr_v

            recent_list = []
            for item in parsed_releases[:5]:
                recent_list.append({
                    "version": item["version_str"],
                    "name": item["name"],
                    "tag": item["tag_name"],
                    "html_url": item["html_url"],
                    "published_at": item["published_at"],
                    "prerelease": item["prerelease"]
                })

            result = {
                "success": True,
                "current_version": APP_VERSION,
                "update_available": update_available,
                "latest_version": latest["version_str"],
                "latest_release_name": latest["name"],
                "latest_release_url": latest["html_url"],
                "latest_release_date": latest["published_at"],
                "latest_release_notes": latest["body"],
                "is_prerelease": latest["prerelease"],
                "recent_releases": recent_list,
                "timestamp_epoch": time.time(),
                "cached": False
            }

            try:
                with open(cache_path, "w", encoding="utf-8") as f:
                    json.dump(result, f, indent=2)
            except Exception:
                pass

            return result

        except Exception as e:
            # If network error occurs, check if stale cache is available
            if os.path.exists(cache_path):
                try:
                    with open(cache_path, "r", encoding="utf-8") as f:
                        cached_data = json.load(f)
                    cached_data["cached"] = True
                    cached_data["network_warning"] = f"Live check failed ({str(e)}), showing cached status."
                    return cached_data
                except Exception:
                    pass

            return {
                "success": False,
                "error": f"Failed to connect to GitHub Releases: {str(e)}",
                "current_version": APP_VERSION,
                "update_available": False
            }


update_service = UpdateService()
