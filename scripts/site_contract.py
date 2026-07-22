#!/usr/bin/env python3
"""Dependency-free contract checks for the Blooming Future static site."""

import hashlib
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse


CONTACT_VALUES = (
    "天津市津南区·启迪科技园 35 号楼",
    "+86 022-5918-5201",
    "400-000-6909",
    "+65 6015 0790",
    "sgfar1999@outlook.com",
)

REQUIRED_ASSETS = (
    "campus-1.jpg",
    "campus-2.jpg",
    "campus-3.jpg",
    "textbook-1.jpg",
    "textbook-2.jpg",
    "textbook-3.jpg",
    "textbook-4.jpg",
    "textbook-5.jpg",
    "cert-mofcom.png",
    "cert-iso9001.png",
    "mascot-elephant.png",
    "bloomingfuture-logo.png",
)

BRAND_COLORS = (
    "#c30d23",
    "#ef7a00",
    "#8fc31f",
    "#2ea7e0",
    "#004089",
)

BRAND_FONTS = (
    "Manrope",
    "Cormorant Garamond",
    "Noto Serif SC",
    "JetBrains Mono",
)


class ResourceParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.resources = []

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if tag in {"img", "script", "source"} and values.get("src"):
            self.resources.append((tag, values["src"]))
        if tag == "link" and values.get("href"):
            rel = values.get("rel", "")
            if "stylesheet" in rel or "preload" in rel:
                self.resources.append((tag, values["href"]))


def read_text(path, issues, label):
    try:
        return path.read_text(encoding="utf-8")
    except (FileNotFoundError, UnicodeDecodeError) as error:
        issues.append(f"missing or unreadable {label}: {error}")
        return ""


def is_external(value):
    return urlparse(value).scheme in {"http", "https"}


def local_resource_path(root, value):
    clean = value.split("?", 1)[0].split("#", 1)[0]
    if not clean or clean.startswith("data:"):
        return None
    return root / clean.lstrip("/")


def read_asset_manifest(root, issues):
    path = root / "assets/img/provenance.json"
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (FileNotFoundError, UnicodeDecodeError, json.JSONDecodeError) as error:
        issues.append(f"missing or unreadable asset provenance manifest: {error}")
        return None

    assets = payload.get("assets")
    if payload.get("schema") != 1 or not isinstance(assets, dict):
        issues.append("invalid asset provenance manifest schema")
        return None
    return assets


def sha256_file(path):
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(128 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def inspect_project(root):
    root = Path(root).resolve()
    issues = []
    index = read_text(root / "index.html", issues, "index.html")
    css = read_text(root / "assets/css/main.css", issues, "main.css")
    script = read_text(root / "assets/js/main.js", issues, "main.js")
    contact = read_text(root / "content/contact.md", issues, "contact.md")
    asset_manifest = read_asset_manifest(root, issues)

    parser = ResourceParser()
    parser.feed(index)
    for tag, value in parser.resources:
        if is_external(value):
            issues.append(f"external runtime asset in <{tag}>: {value}")
            continue
        resource_path = local_resource_path(root, value)
        if resource_path and not resource_path.is_file():
            issues.append(f"missing local runtime asset: {value}")

    if re.search(r"url\(\s*['\"]?https?://", css, re.IGNORECASE):
        issues.append("external runtime asset in CSS url()")
    if re.search(r"(?:fetch|import)\s*\(\s*['\"]https?://", script):
        issues.append("external runtime asset in JavaScript")

    for filename in REQUIRED_ASSETS:
        asset_path = root / "assets/img" / filename
        if not asset_path.is_file():
            issues.append(f"missing required asset: assets/img/{filename}")
            continue
        if asset_manifest is None:
            continue
        record = asset_manifest.get(filename)
        expected_hash = record.get("sha256") if isinstance(record, dict) else None
        if not isinstance(expected_hash, str) or not re.fullmatch(r"[0-9a-f]{64}", expected_hash):
            issues.append(f"missing valid provenance hash: assets/img/{filename}")
            continue
        actual_hash = sha256_file(asset_path)
        if actual_hash != expected_hash:
            issues.append(f"asset identity mismatch: assets/img/{filename}")

    for value in CONTACT_VALUES:
        if value not in index:
            issues.append(f"missing contact value in index.html: {value}")
        if value not in contact:
            issues.append(f"missing contact value in content/contact.md: {value}")

    for color in BRAND_COLORS:
        if color not in css:
            issues.append(f"missing brand color token: {color}")
    for font in BRAND_FONTS:
        if font not in css:
            issues.append(f"missing brand font: {font}")

    if "prefers-reduced-motion" not in script:
        issues.append("missing reduced motion handling in JavaScript")
    if not re.search(r"Math\.min\([^\n]*devicePixelRatio[^\n]*,\s*2\s*\)", script):
        issues.append("missing Canvas DPR cap at 2")
    if not all(token in script for token in ("isMobile", "codeCount", "connections")):
        issues.append("missing mobile motion degradation")

    forbidden_files = ("package.json", "package-lock.json", "yarn.lock", "pnpm-lock.yaml")
    for filename in forbidden_files:
        if (root / filename).exists():
            issues.append(f"forbidden dependency/build file: {filename}")

    return issues


def main(argv):
    root = Path(argv[1]) if len(argv) > 1 else Path.cwd()
    issues = inspect_project(root)
    if issues:
        print(f"[contract] FAIL ({len(issues)} issue(s))")
        for issue in issues:
            print(f"- {issue}")
        return 1
    print("[contract] PASS: asset identity, brand, contacts, and motion baseline")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
