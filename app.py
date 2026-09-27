"""
Gold Nile - Render Server
Serves static files + provides /api/admin/create-user endpoint.
"""
from __future__ import annotations
import os
import json
import urllib.request
import urllib.error
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")


def supabase_request(method, path, *, api_key, bearer=None, body=None):
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


class Handler(SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_POST(self):
        if urlparse(self.path).path == "/api/admin/create-user":
            self.handle_create_user()
            return
        self.send_error(404)

    def handle_create_user(self):
        if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
            self.send_json({"error": "Server not configured."}, status=500)
            return

        auth_header = self.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            self.send_json({"error": "Unauthorized."}, status=401)
            return
        caller_token = auth_header.split(" ", 1)[1]

        # Verify caller identity
        status, caller = supabase_request(
            "GET", "/auth/v1/user",
            api_key=SUPABASE_SERVICE_ROLE_KEY,
            bearer=caller_token
        )
        if status != 200 or not caller or not caller.get("id"):
            self.send_json({"error": "Invalid session."}, status=401)
            return
        caller_id = caller["id"]

        # Verify caller is owner
        status, profiles = supabase_request(
            "GET",
            f"/rest/v1/profiles?auth_user_id=eq.{caller_id}&select=role,status",
            api_key=SUPABASE_SERVICE_ROLE_KEY,
        )
        caller_profile = (profiles or [None])[0]
        if (status != 200 or not caller_profile
                or caller_profile.get("role") != "owner"
                or caller_profile.get("status") != "allowed"):
            self.send_json({"error": "Owner access required."}, status=403)
            return

        # Read new member data
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > 5000:
                raise ValueError("Invalid request size.")
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
        except (ValueError, json.JSONDecodeError, UnicodeDecodeError):
            self.send_json({"error": "Invalid payload."}, status=400)
            return

        email = str(payload.get("email", "")).strip().lower()
        password = str(payload.get("password", ""))
        full_name = str(payload.get("full_name", "")).strip()

        if not email or "@" not in email or len(password) < 8:
            self.send_json({"error": "Valid email and password (8+ chars) required."}, status=400)
            return

        # Create user in Supabase Auth
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
            msg = (created or {}).get("msg") or (created or {}).get("message") or "Create failed."
            self.send_json({"error": msg}, status=400)
            return

        new_user_id = created.get("id") if created else None

        # Activate profile (trigger creates it as 'pending')
        if new_user_id:
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
            # Verify
            _, check = supabase_request(
                "GET",
                f"/rest/v1/profiles?auth_user_id=eq.{new_user_id}&select=id",
                api_key=SUPABASE_SERVICE_ROLE_KEY,
            )
            if not check:
                self.send_json({"error": "User created but profile link failed."}, status=500)
                return

        self.send_json({"ok": True})

    def send_json(self, payload, status=200):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt, *args):
        print(f"{self.address_string()} - {fmt % args}")


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