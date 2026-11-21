"""
Asset minification and bundling script for FinDashIQ (PERF-1).
Builds:
  - static/dist/style.min.css      (from static/css/style.css)
  - static/dist/app.bundle.min.js  (concatenation of the 13 frontend modules in exact load order)
"""

import os
import re
import shutil
import subprocess
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = ROOT_DIR / "static"
DIST_DIR = STATIC_DIR / "dist"

JS_BUNDLE_ORDER = [
    "static/js/modules/core/state.js",
    "static/js/modules/core/currency.js",
    "static/js/modules/core/utils.js",
    "static/js/modules/core/i18n.js",
    "static/js/modules/auth/auth.js",
    "static/js/modules/terminal/charts.js",
    "static/js/modules/terminal/deep_dive.js",
    "static/js/modules/backtest/backtest_engine.js",
    "static/js/modules/backtest/paper_trades.js",
    "static/js/modules/watchlist/watchlist.js",
    "static/js/modules/scanner/scanner.js",
    "static/js/modules/alerts/alerts.js",
    "static/js/app.js",
]


def minify_css(css_text: str) -> str:
    """Safely strips CSS comments and redundant whitespace while preserving strings & calc()."""
    out = []
    i = 0
    n = len(css_text)
    in_string = None

    while i < n:
        ch = css_text[i]
        if in_string:
            out.append(ch)
            if ch == "\\" and i + 1 < n:
                out.append(css_text[i + 1])
                i += 2
                continue
            if ch == in_string:
                in_string = None
            i += 1
            continue

        if ch in ("'", '"'):
            in_string = ch
            out.append(ch)
            i += 1
            continue

        if ch == "/" and i + 1 < n and css_text[i + 1] == "*":
            end = css_text.find("*/", i + 2)
            if end == -1:
                break
            out.append(" ")
            i = end + 2
            continue

        if ch in ("\r", "\n", "\t", " "):
            while i < n and css_text[i] in ("\r", "\n", "\t", " "):
                i += 1
            if out and out[-1] != " ":
                out.append(" ")
            continue

        out.append(ch)
        i += 1

    collapsed = "".join(out).strip()
    collapsed = re.sub(r"\s*([{};,])\s*", r"\1", collapsed)
    collapsed = re.sub(r";\}", "}", collapsed)
    collapsed = re.sub(r"\s*!important", "!important", collapsed)
    return collapsed


def strip_js_comments_safe(js_text: str) -> str:
    """
    Removes pure full-line // comments (outside strings/template literals) and trims blank lines
    without risking corruption of inline regex literals or ASI line boundaries.
    """
    lines = js_text.replace("\r\n", "\n").replace("\r", "\n").split("\n")
    cleaned_lines = []
    in_template = False

    for line in lines:
        stripped = line.strip()
        if not in_template:
            if not stripped or stripped.startswith("//"):
                continue
            # Track unescaped backtick parity conservatively when line starts cleanly
        # Count unescaped backticks while ignoring quoted single/double strings on this line
        i = 0
        ln = len(line)
        in_sq = False
        in_dq = False
        while i < ln:
            c = line[i]
            if c == "\\":
                i += 2
                continue
            if in_template:
                if c == "`":
                    in_template = False
            elif in_sq:
                if c == "'":
                    in_sq = False
            elif in_dq:
                if c == '"':
                    in_dq = False
            else:
                if c == "`":
                    in_template = True
                elif c == "'":
                    in_sq = True
                elif c == '"':
                    in_dq = True
                elif c == "/" and i + 1 < ln and line[i + 1] == "/":
                    # Inline comment starts — only keep up to i if not after ':' or '=' (e.g., https:// or regex)
                    break
            i += 1

        if in_template:
            cleaned_lines.append(line)
        else:
            cleaned_lines.append(line.rstrip())

    return "\n".join(cleaned_lines) + "\n"


def build_assets(validate_node: bool = True) -> dict:
    DIST_DIR.mkdir(parents=True, exist_ok=True)

    css_src = STATIC_DIR / "css" / "style.css"
    css_dst = DIST_DIR / "style.min.css"
    raw_css = css_src.read_text(encoding="utf-8")
    min_css = minify_css(raw_css)
    css_dst.write_text(min_css, encoding="utf-8")

    js_parts = []
    raw_js_bytes = 0
    for rel_path in JS_BUNDLE_ORDER:
        p = ROOT_DIR / rel_path
        if not p.is_file():
            raise FileNotFoundError(f"Missing JS module in bundle order: {rel_path}")
        txt = p.read_text(encoding="utf-8")
        raw_js_bytes += len(txt.encode("utf-8"))
        js_parts.append(f"/* {rel_path} */\n" + strip_js_comments_safe(txt).rstrip() + ";\n")

    bundle_js = "\n".join(js_parts)
    js_dst = DIST_DIR / "app.bundle.min.js"
    js_dst.write_text(bundle_js, encoding="utf-8")

    node_exe = shutil.which("node")
    if validate_node and node_exe:
        subprocess.run([node_exe, "--check", str(js_dst)], check=True)

    return {
        "cssRawBytes": len(raw_css.encode("utf-8")),
        "cssMinBytes": len(min_css.encode("utf-8")),
        "jsRawBytes": raw_js_bytes,
        "jsMinBytes": len(bundle_js.encode("utf-8")),
        "cssPath": str(css_dst),
        "jsPath": str(js_dst),
    }


if __name__ == "__main__":
    stats = build_assets(validate_node=True)
    print(
        f"Built static/dist/style.min.css ({stats['cssMinBytes']} B from {stats['cssRawBytes']} B) "
        f"and static/dist/app.bundle.min.js ({stats['jsMinBytes']} B from {stats['jsRawBytes']} B)"
    )
