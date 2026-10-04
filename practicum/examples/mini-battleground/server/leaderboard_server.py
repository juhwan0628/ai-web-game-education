#!/usr/bin/env python3
import argparse
import json
import os
import re
import threading
import time
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse


BASE_DIR = Path(__file__).resolve().parents[1]
DATA_PATH = BASE_DIR / "data" / "leaderboard.json"
ALLOWED_PATHS = {"/game/api/leaderboard", "/api/leaderboard"}
MAX_BODY_BYTES = 4096
MAX_SCORES = 10
RATE_WINDOW_SECONDS = 30
RATE_LIMIT_POSTS = 5
NAME_RE = re.compile(r"[^A-Z0-9\uac00-\ud7a3]")
RANKS = {"S", "A", "B", "C", "D"}

store_lock = threading.Lock()
rate_lock = threading.Lock()
rate_buckets = {}


def clean_name(value):
    name = NAME_RE.sub("", str(value or "").upper())[:10]
    return name or None


def coerce_int(payload, key, minimum, maximum):
    value = payload.get(key)
    if isinstance(value, bool):
        raise ValueError(f"{key} must be a number")
    try:
        number = int(value)
    except (TypeError, ValueError):
        raise ValueError(f"{key} must be a number") from None
    if number < minimum or number > maximum:
        raise ValueError(f"{key} is out of range")
    return number


def sort_scores(scores):
    return sorted(
        scores,
        key=lambda row: (
            -int(row.get("score", 0)),
            -int(row.get("kills", 0)),
            -int(row.get("seconds", 0)),
            str(row.get("date", "")),
        ),
    )[:MAX_SCORES]


def read_scores():
    if not DATA_PATH.exists():
        return []
    with DATA_PATH.open("r", encoding="utf-8") as handle:
        payload = json.load(handle)
    if isinstance(payload, list):
        return payload
    if isinstance(payload, dict) and isinstance(payload.get("scores"), list):
        return payload["scores"]
    return []


def write_scores(scores):
    DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    temp_path = DATA_PATH.with_suffix(".json.tmp")
    with temp_path.open("w", encoding="utf-8") as handle:
        json.dump(scores, handle, ensure_ascii=False, indent=2)
        handle.write("\n")
    os.replace(temp_path, DATA_PATH)


def validate_entry(payload):
    if not isinstance(payload, dict):
        raise ValueError("body must be a JSON object")
    name = clean_name(payload.get("name"))
    if not name:
        raise ValueError("name is required")
    rank = str(payload.get("rank", "")).upper()
    if rank not in RANKS:
        raise ValueError("rank is invalid")
    won = payload.get("won")
    if not isinstance(won, bool):
        raise ValueError("won must be a boolean")
    return {
        "name": name,
        "score": coerce_int(payload, "score", 0, 999999),
        "kills": coerce_int(payload, "kills", 0, 999),
        "rank": rank,
        "level": coerce_int(payload, "level", 1, 200),
        "crates": coerce_int(payload, "crates", 0, 999),
        "seconds": coerce_int(payload, "seconds", 0, 7200),
        "won": won,
        "date": datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
    }


def client_ip(headers, address):
    forwarded = headers.get("x-forwarded-for", "")
    if forwarded:
        return forwarded.split(",", 1)[0].strip()
    return address[0]


def rate_limited(ip):
    now = time.monotonic()
    with rate_lock:
        bucket = [stamp for stamp in rate_buckets.get(ip, []) if now - stamp < RATE_WINDOW_SECONDS]
        if len(bucket) >= RATE_LIMIT_POSTS:
            rate_buckets[ip] = bucket
            return True
        bucket.append(now)
        rate_buckets[ip] = bucket
        return False


class LeaderboardHandler(BaseHTTPRequestHandler):
    server_version = "MiniBattlegroundLeaderboard/1.0"

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Accept")
        super().end_headers()

    def send_json(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def send_error_json(self, status, message):
        self.send_json(status, {"error": message})

    def is_leaderboard_path(self):
        return urlparse(self.path).path in ALLOWED_PATHS

    def do_OPTIONS(self):
        if not self.is_leaderboard_path():
            self.send_error_json(404, "not found")
            return
        self.send_response(204)
        self.send_header("Content-Length", "0")
        self.end_headers()

    def do_GET(self):
        if not self.is_leaderboard_path():
            self.send_error_json(404, "not found")
            return
        try:
            with store_lock:
                scores = sort_scores(read_scores())
            self.send_json(200, {"scores": scores})
        except Exception:
            self.send_error_json(500, "failed to read leaderboard")

    def do_POST(self):
        if not self.is_leaderboard_path():
            self.send_error_json(404, "not found")
            return
        ip = client_ip(self.headers, self.client_address)
        if rate_limited(ip):
            self.send_error_json(429, "too many submissions")
            return
        try:
            length = int(self.headers.get("content-length", "0"))
        except ValueError:
            self.send_error_json(400, "invalid content length")
            return
        if length <= 0 or length > MAX_BODY_BYTES:
            self.send_error_json(400, "invalid body size")
            return
        try:
            body = self.rfile.read(length).decode("utf-8")
            entry = validate_entry(json.loads(body))
        except (UnicodeDecodeError, json.JSONDecodeError, ValueError) as error:
            self.send_error_json(400, str(error))
            return
        try:
            with store_lock:
                scores = sort_scores([*read_scores(), entry])
                write_scores(scores)
            self.send_json(200, {"scores": scores})
        except Exception:
            self.send_error_json(500, "failed to save leaderboard")


def main():
    parser = argparse.ArgumentParser(description="Mini Battleground leaderboard API")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8765)
    args = parser.parse_args()
    DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    if not DATA_PATH.exists():
        write_scores([])
    server = ThreadingHTTPServer((args.host, args.port), LeaderboardHandler)
    print(f"leaderboard API listening on http://{args.host}:{args.port}", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
