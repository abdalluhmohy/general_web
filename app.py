"""
Gold Nile - Render Static Server
=================================
Serves static frontend files and exposes one admin endpoint:
  POST /api/admin/create-user  → create a new user via Supabase Admin API

Environment variables required on Render:
  SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY
  PORT (optional, defaults to 10000)
"""
from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

# ============================================================
# Configuration
# ============================================================
SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

MAX_BODY_BYTES = 5000
MIN_PASSWORD_LENGTH = 8

# Basic security headers applied to every response
SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
}


# ============================================================
# Supabase helper
# ============================================================
def supabase_request(method, path, *, api_key, bearer=None, body=None):
    """Perform an HTTP request against the Supabase REST/Auth API."""
    url = f"{SUPABASE_URL}{path}"
    data = json.dumps(body).encode("utf-8") if body is not None else None

    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("apikey", api_key)
    req.add_header("Authorization", f"Bearer {bearer or api_key}")
    req.add_header("Content-Type", "application/json")
    if method in ("PATCH", "POST"):
        req.add_header("Prefer", "return=representation")

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            raw = resp.read()
            return resp.status, (json.loads(raw) if raw else None)
    except urllib.error.HTTPError as error:
        raw = error.read()
        try:
            parsed = json.loads(raw) if raw else None
        except json.JSONDecodeError:
            parsed = {"message": raw.decode("utf-8", "ignore")}
        return error.code, parsed
    except urllib.error.URLError as error:
        return 0, {"message": f"Network error: {error.reason}"}


# ============================================================
# HTTP Handler
# ============================================================
class Handler(SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    # -------- Headers --------
    def end_headers(self):
        for key, value in SECURITY_HEADERS.items():
            self.send_header(key, value)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        super().end_headers()

    # -------- OPTIONS (CORS preflight) --------
    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    # -------- POST routing --------
    def do_POST(self):
        path = urlparse(self.path).path
        if path == "/api/admin/create-user":
            self.handle_create_user()
            return
        self.send_error(404)

    # ========================================================
    # /api/admin/create-user
    # ========================================================
    def handle_create_user(self):
        # 1) Server must be configured
        if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
            self.send_json({"error": "Server not configured."}, status=500)
            return

        # 2) Caller must provide a Bearer token
        auth_header = self.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            self.send_json({"error": "Unauthorized."}, status=401)
            return
        caller_token = auth_header.split(" ", 1)[1].strip()

        # 3) Verify caller identity with Supabase Auth
        status, caller = supabase_request(
            "GET", "/auth/v1/user",
            api_key=SUPABASE_SERVICE_ROLE_KEY,
            bearer=caller_token,
        )
        if status != 200 or not caller or not caller.get("id"):
            self.send_json({"error": "Invalid session."}, status=401)
            return
        caller_id = caller["id"]

        # 4) Verify caller has role = owner and status = allowed
        status, profiles = supabase_request(
            "GET",
            f"/rest/v1/profiles?auth_user_id=eq.{caller_id}&select=role,status",
            api_key=SUPABASE_SERVICE_ROLE_KEY,
        )
        caller_profile = (profiles or [None])[0] if isinstance(profiles, list) else None
        if (
            status != 200
            or not caller_profile
            or caller_profile.get("role") != "owner"
            or caller_profile.get("status") != "allowed"
        ):
            self.send_json({"error": "Owner access required."}, status=403)
            return

        # 5) Read and validate payload
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > MAX_BODY_BYTES:
                raise ValueError("Invalid request size.")
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
        except (ValueError, json.JSONDecodeError, UnicodeDecodeError):
            self.send_json({"error": "Invalid payload."}, status=400)
            return

        email = str(payload.get("email", "")).strip().lower()
        password = str(payload.get("password", ""))
        full_name = str(payload.get("full_name", "")).strip()

        if not email or "@" not in email or "." not in email.split("@")[-1]:
            self.send_json({"error": "Valid email required."}, status=400)
            return
        if len(password) < MIN_PASSWORD_LENGTH:
            self.send_json(
                {"error": f"Password must be at least {MIN_PASSWORD_LENGTH} characters."},
                status=400,
            )
            return

        # 6) Create user via Supabase Admin API (bypasses sign-up toggle)
        status, created = supabase_request(
            "POST", "/auth/v1/admin/users",
            api_key=SUPABASE_SERVICE_ROLE_KEY,
            body={
                "email": email,
                "password": password,
                "email_confirm": True,
                "user_metadata": {"full_name": full_name},
            },
        )
        if status not in (200, 201):
            msg = (
                (created or {}).get("msg")
                or (created or {}).get("message")
                or "Create failed."
            )
            self.send_json({"error": msg}, status=400)
            return

        new_user_id = created.get("id") if isinstance(created, dict) else None
        if not new_user_id:
            self.send_json({"error": "User created but no ID returned."}, status=500)
            return

        # 7) Activate the auto-created profile (trigger creates it as 'pending')
        supabase_request(
            "PATCH",
            f"/rest/v1/profiles?auth_user_id=eq.{new_user_id}",
            api_key=SUPABASE_SERVICE_ROLE_KEY,
            body={
                "status": "allowed",
                "role": "reader",
                "full_name": full_name,
            },
        )

        # 8) Verify the profile is now linked
        _, check = supabase_request(
            "GET",
            f"/rest/v1/profiles?auth_user_id=eq.{new_user_id}&select=id",
            api_key=SUPABASE_SERVICE_ROLE_KEY,
        )
        if not check:
            self.send_json({"error": "User created but profile link failed."}, status=500)
            return

        self.send_json({"ok": True})

    # ========================================================
    # Utilities
    # ========================================================
    def send_json(self, payload, status=200):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt, *args):
        print(f"{self.address_string()} - {fmt % args}")


# ============================================================
# Entry point
# ============================================================
def main():
    port = int(os.environ.get("PORT", "10000"))
    host = "0.0.0.0"
    server = ThreadingHTTPServer((host, port), Handler)
    print(f"Gold Nile server running on http://{host}:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()