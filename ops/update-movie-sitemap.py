#!/usr/bin/env python3
"""Refresh published movie paths used by FilmBase's sitemap and API2 adapter."""

import json
import re
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET


INDEX_URL = "https://9jarocks.net/wp-sitemap.xml"
OUTPUT = Path(__file__).resolve().parents[1] / "lib/movie-sitemap-paths.json"
NAMESPACE = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
TITLE_PATH = re.compile(r"^/videodownload/.+-id([0-9]+)\.html$")


def read_xml(url: str) -> ET.Element:
    if urlparse(url).hostname != "9jarocks.net" or not url.startswith("https://"):
        raise ValueError(f"Unexpected sitemap host: {url}")
    request = Request(url, headers={"User-Agent": "FilmBase sitemap updater"})
    with urlopen(request, timeout=30) as response:
        return ET.fromstring(response.read())


index = read_xml(INDEX_URL)
shards = [
    node.text
    for node in index.findall(f"{NAMESPACE}sitemap/{NAMESPACE}loc")
    if node.text and re.fullmatch(r"https://9jarocks\.net/wp-sitemap-posts-post-[0-9]+\.xml", node.text)
]
if not shards:
    raise RuntimeError("Publisher sitemap has no post shards")

paths = {}
for shard in shards:
    for node in read_xml(shard).findall(f"{NAMESPACE}url/{NAMESPACE}loc"):
        path = urlparse(node.text or "").path
        match = TITLE_PATH.fullmatch(path)
        if match:
            paths[match.group(1)] = path.lstrip("/")

if len(paths) < 10_000 or len(paths) > 50_000:
    raise RuntimeError(f"Unexpected movie count: {len(paths)}")

OUTPUT.write_text(json.dumps({key: paths[key] for key in sorted(paths, key=int)}, separators=(",", ":")) + "\n")
print(f"Wrote {len(paths)} published title paths to {OUTPUT}")
