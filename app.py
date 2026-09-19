from __future__ import annotations
import os
import argparse
import json
import sqlite3
from datetime import datetime, timezone
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
DB_PATH = ROOT / "gold-nile.db"
HTML_FILE = "gold-nile-partner-dashboard.html"


def connect_db() -> sqlite3.Connection:
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def initialize_database() -> None:
    with connect_db() as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS dashboard_state (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                data_json TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS bank_accounts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                bank TEXT NOT NULL,
                account_no TEXT NOT NULL,
                currency TEXT NOT NULL,
                balance REAL NOT NULL DEFAULT 0,
                purpose TEXT,
                iban TEXT,
                notes TEXT
            );
            CREATE TABLE IF NOT EXISTS journal_entries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                entry_date TEXT NOT NULL,
                entry_type TEXT NOT NULL,
                bank TEXT NOT NULL,
                currency TEXT NOT NULL,
                amount REAL NOT NULL DEFAULT 0,
                description TEXT,
                direction TEXT NOT NULL CHECK(direction IN ('in', 'out'))
            );
            CREATE TABLE IF NOT EXISTS transfers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                invoice_no TEXT NOT NULL,
                transfer_date TEXT NOT NULL,
                direction TEXT NOT NULL CHECK(direction IN ('in', 'out')),
                from_to TEXT NOT NULL,
                amount REAL NOT NULL DEFAULT 0,
                currency TEXT NOT NULL,
                status TEXT NOT NULL,
                note TEXT,
                document TEXT,
                transfer_type TEXT NOT NULL DEFAULT 'incoming_external',
                party TEXT,
                purpose TEXT
            );
            CREATE TABLE IF NOT EXISTS employees (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                department TEXT NOT NULL,
                role TEXT,
                phone TEXT,
                is_manager INTEGER NOT NULL DEFAULT 0,
                status TEXT NOT NULL,
                salary REAL NOT NULL DEFAULT 0,
                currency TEXT,
                hire_date TEXT,
                attendance TEXT,
                attendance_log TEXT,
                absence TEXT,
                deductions REAL NOT NULL DEFAULT 0,
                bonuses REAL NOT NULL DEFAULT 0,
                commissions REAL NOT NULL DEFAULT 0,
                warnings TEXT,
                contracts TEXT,
                achievements TEXT,
                passport_number TEXT,
                passport_doc TEXT,
                photo TEXT,
                notes TEXT
            );
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                department TEXT NOT NULL,
                assignee TEXT,
                status TEXT NOT NULL,
                due TEXT,
                priority TEXT,
                notes TEXT
            );
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                phone TEXT,
                password_hash TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'allowed',
                read_only INTEGER NOT NULL DEFAULT 1,
                login_count INTEGER NOT NULL DEFAULT 0,
                last_login TEXT,
                created_at TEXT NOT NULL
            );
            """
        )
        transfer_columns = {
            row[1] for row in connection.execute("PRAGMA table_info(transfers)")
        }
        if "document" not in transfer_columns:
            connection.execute("ALTER TABLE transfers ADD COLUMN document TEXT")
        if "transfer_type" not in transfer_columns:
            connection.execute("ALTER TABLE transfers ADD COLUMN transfer_type TEXT NOT NULL DEFAULT 'incoming_external'")
        if "party" not in transfer_columns:
            connection.execute("ALTER TABLE transfers ADD COLUMN party TEXT")
        if "purpose" not in transfer_columns:
            connection.execute("ALTER TABLE transfers ADD COLUMN purpose TEXT")
        account_columns = {row[1] for row in connection.execute("PRAGMA table_info(bank_accounts)")}
        if "purpose" not in account_columns:
            connection.execute("ALTER TABLE bank_accounts ADD COLUMN purpose TEXT")
        employee_columns = {row[1] for row in connection.execute("PRAGMA table_info(employees)")}
        employee_migrations = {
            "salary": "REAL NOT NULL DEFAULT 0", "currency": "TEXT", "hire_date": "TEXT",
            "is_manager": "INTEGER NOT NULL DEFAULT 0", "absence": "TEXT", "attendance_log": "TEXT", "bonuses": "REAL NOT NULL DEFAULT 0", "commissions": "REAL NOT NULL DEFAULT 0",
            "passport_number": "TEXT", "passport_doc": "TEXT", "photo": "TEXT",
        }
        for column, definition in employee_migrations.items():
            if column not in employee_columns:
                connection.execute(f"ALTER TABLE employees ADD COLUMN {column} {definition}")


def valid_state(data: object) -> bool:
    return isinstance(data, dict) and all(
        isinstance(data.get(key), list)
        for key in ("ledger", "devices", "milestones", "steps")
    ) and isinstance(data.get("settings"), dict)


def replace_banking_tables(connection: sqlite3.Connection, banking: dict) -> None:
    connection.execute("DELETE FROM bank_accounts")
    connection.execute("DELETE FROM journal_entries")
    connection.execute("DELETE FROM transfers")

    for account in banking.get("accounts", []):
        connection.execute(
            """INSERT INTO bank_accounts
               (bank, account_no, currency, balance, purpose, iban, notes)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (
                str(account.get("bank", "")),
                str(account.get("accountNo", "")),
                str(account.get("currency", "")),
                float(account.get("balance") or 0),
                str(account.get("purpose", "")),
                str(account.get("iban", "")),
                str(account.get("notes", "")),
            ),
        )

    for entry in banking.get("journal", []):
        direction = "out" if entry.get("direction") == "out" else "in"
        connection.execute(
            """INSERT INTO journal_entries
               (entry_date, entry_type, bank, currency, amount, description, direction)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (
                str(entry.get("date", "")),
                str(entry.get("type", "")),
                str(entry.get("bank", "")),
                str(entry.get("currency", "")),
                float(entry.get("amount") or 0),
                str(entry.get("description", "")),
                direction,
            ),
        )

    for transfer in banking.get("transfers", []):
        direction = "out" if transfer.get("direction") == "out" else "in"
        connection.execute(
                """INSERT INTO transfers
                    (invoice_no, transfer_date, direction, from_to, amount, currency, status, note, document, transfer_type, party, purpose)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                str(transfer.get("invoiceNo", "")),
                str(transfer.get("date", "")),
                direction,
                str(transfer.get("fromTo", "")),
                float(transfer.get("amount") or 0),
                str(transfer.get("currency", "")),
                str(transfer.get("status", "")),
                str(transfer.get("note", "")),
                str(transfer.get("doc", "")),
                str(transfer.get("transferType", "incoming_external")),
                str(transfer.get("party", transfer.get("fromTo", ""))),
                str(transfer.get("purpose", "")),
            ),
        )


def replace_people_tables(connection: sqlite3.Connection, data: dict) -> None:
    connection.execute("DELETE FROM employees")
    connection.execute("DELETE FROM tasks")
    for employee in data.get("employees", []):
        connection.execute(
            """INSERT INTO employees
               (name, department, role, phone, is_manager, status, salary, currency, hire_date, attendance, attendance_log, absence, deductions, bonuses, commissions, warnings, contracts, achievements, passport_number, passport_doc, photo, notes)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                str(employee.get("name", "")), str(employee.get("department", "")),
                str(employee.get("role", "")), str(employee.get("phone", "")),
                1 if employee.get("isManager") else 0, str(employee.get("status", "active")),
                float(employee.get("salary") or 0), str(employee.get("currency", "USD")),
                str(employee.get("hireDate", "")), str(employee.get("attendance", "")), json.dumps(employee.get("attendanceLog", []), ensure_ascii=False), str(employee.get("absence", "")),
                float(employee.get("deductions") or 0), float(employee.get("bonuses") or 0), float(employee.get("commissions") or 0),
                str(employee.get("warnings", "")), str(employee.get("contracts", "")), str(employee.get("achievements", "")),
                str(employee.get("passportNumber", "")), str(employee.get("passportDoc", "")), str(employee.get("photo", "")), str(employee.get("notes", "")),
            ),
        )
    for task in data.get("tasks", []):
        connection.execute(
            """INSERT INTO tasks
               (title, department, assignee, status, due, priority, notes)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (
                str(task.get("title", "")), str(task.get("department", "")),
                str(task.get("assignee", "")), str(task.get("status", "جديدة")),
                str(task.get("due", "")), str(task.get("priority", "متوسطة")),
                str(task.get("notes", "")),
            ),
        )


def replace_users_table(connection: sqlite3.Connection, data: dict) -> None:
    connection.execute("DELETE FROM users")
    for user in data.get("users", []):
        connection.execute(
            """INSERT INTO users
               (name, email, phone, password_hash, status, read_only, login_count, last_login, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                str(user.get("name", "")), str(user.get("email", "")).lower(), str(user.get("phone", "")),
                str(user.get("passwordHash", "")), str(user.get("status", "allowed")),
                1 if user.get("readOnly", True) else 0, int(user.get("loginCount") or 0),
                str(user.get("lastLogin", "")), str(user.get("createdAt", "")),
            ),
        )


def save_state(data: dict) -> None:
    timestamp = datetime.now(timezone.utc).isoformat()
    payload = json.dumps(data, ensure_ascii=False)
    with connect_db() as connection:
        connection.execute(
            """INSERT INTO dashboard_state (id, data_json, updated_at)
               VALUES (1, ?, ?)
               ON CONFLICT(id) DO UPDATE SET
                 data_json = excluded.data_json,
                 updated_at = excluded.updated_at""",
            (payload, timestamp),
        )
        replace_banking_tables(connection, data.get("banking") or {})
        replace_people_tables(connection, data)
        replace_users_table(connection, data)


def load_state() -> dict | None:
    with connect_db() as connection:
        row = connection.execute(
            "SELECT data_json FROM dashboard_state WHERE id = 1"
        ).fetchone()
    if not row:
        return None
    try:
        data = json.loads(row["data_json"])
    except json.JSONDecodeError:
        return None
    return data if valid_state(data) else None


class DashboardHandler(SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def end_headers(self) -> None:
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, PUT, OPTIONS")
        super().end_headers()

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self.end_headers()

    def do_GET(self) -> None:
        if urlparse(self.path).path == "/api/state":
            self.send_json(load_state())
            return
        super().do_GET()

    def do_PUT(self) -> None:
        if urlparse(self.path).path != "/api/state":
            self.send_error(404)
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > 10_000_000:
                raise ValueError("invalid request size")
            data = json.loads(self.rfile.read(length).decode("utf-8"))
            if not valid_state(data):
                raise ValueError("invalid dashboard state")
            save_state(data)
            self.send_json(data)
        except (ValueError, json.JSONDecodeError, UnicodeDecodeError) as error:
            self.send_json({"error": str(error)}, status=400)

    def send_json(self, payload: object, status: int = 200) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format: str, *args: object) -> None:
        print(f"{self.address_string()} - {format % args}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Gold Nile dashboard SQLite server")
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=4000)
    args = parser.parse_args()
    initialize_database()
    server = ThreadingHTTPServer((args.host, args.port), DashboardHandler)
    print(f"Dashboard: http://{args.host}:{args.port}/{HTML_FILE}")
    print(f"SQLite:    {DB_PATH}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
