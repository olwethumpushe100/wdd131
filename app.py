import csv
import hmac
import io
import os
import re
import secrets
import sqlite3
import time
from collections import defaultdict, deque
from contextlib import closing
from datetime import timedelta
from functools import wraps
from urllib.parse import urlencode, urlparse

from dotenv import load_dotenv
from flask import Flask, Response, abort, g, redirect, render_template, request, session, url_for

load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

LEVELS = ("beginner", "intermediate", "advanced")
DAYS = ("Saturday", "Sunday", "Weekdays")
INTERESTS = ("Day hikes", "Trail running", "Photography", "Trail conservation")
EMAIL_PATTERN = re.compile(r"^[^@\s<>]+@[^@\s<>]+\.[^@\s<>]+$")
CONTROL_CHARACTERS = re.compile(r"[\x00-\x1f\x7f]")

CONTENT_SECURITY_POLICY = (
    "default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; "
    "font-src https://fonts.gstatic.com; img-src 'self'; form-action 'self'; "
    "base-uri 'self'; object-src 'none'; frame-ancestors 'none'"
)


class RateLimiter:
    """Counts requests per key in a sliding window. One process only."""

    def __init__(self):
        self.hits = defaultdict(deque)

    def allow(self, key, limit, window_seconds):
        now = time.monotonic()
        recent = self.hits[key]
        while recent and now - recent[0] > window_seconds:
            recent.popleft()
        if len(recent) >= limit:
            return False
        recent.append(now)
        return True


def clean(value, max_length):
    return CONTROL_CHARACTERS.sub("", value or "").strip()[:max_length]


def spreadsheet_safe(value):
    text = str(value)
    return f"'{text}" if text[:1] in ("=", "+", "-", "@") else text


def create_app(test_config=None):
    app = Flask(__name__, static_folder=os.path.join(BASE_DIR, "site"), static_url_path="")
    app.config.update(
        SECRET_KEY=os.environ.get("SECRET_KEY") or secrets.token_hex(32),
        ADMIN_PASSWORD=os.environ.get("ADMIN_PASSWORD", ""),
        DATABASE=os.environ.get("DATABASE_PATH", os.path.join(BASE_DIR, "data", "trailmate.db")),
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE="Lax",
        SESSION_COOKIE_SECURE=os.environ.get("COOKIE_SECURE", "1") == "1",
        PERMANENT_SESSION_LIFETIME=timedelta(hours=2),
        MAX_CONTENT_LENGTH=16 * 1024,
    )
    if test_config:
        app.config.update(test_config)

    if os.environ.get("TRUST_PROXY") == "1":
        from werkzeug.middleware.proxy_fix import ProxyFix
        app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)

    limiter = RateLimiter()

    # ---------- database ----------
    def get_db():
        if "db" not in g:
            g.db = sqlite3.connect(app.config["DATABASE"])
            g.db.row_factory = sqlite3.Row
        return g.db

    @app.teardown_appcontext
    def close_db(_error):
        db = g.pop("db", None)
        if db is not None:
            db.close()

    os.makedirs(os.path.dirname(app.config["DATABASE"]), exist_ok=True)
    with closing(sqlite3.connect(app.config["DATABASE"])) as connection:
        with open(os.path.join(BASE_DIR, "schema.sql")) as schema:
            connection.executescript(schema.read())

    # ---------- helpers ----------
    def same_origin():
        source = request.headers.get("Origin") or request.headers.get("Referer")
        return bool(source) and urlparse(source).netloc == request.host

    def require_same_origin():
        if not same_origin():
            abort(403)

    def admin_required(view):
        @wraps(view)
        def wrapper(*args, **kwargs):
            if not app.config["ADMIN_PASSWORD"]:
                abort(503)
            if not session.get("admin"):
                return redirect(url_for("admin_login"))
            return view(*args, **kwargs)
        return wrapper

    @app.after_request
    def add_security_headers(response):
        response.headers["Content-Security-Policy"] = CONTENT_SECURITY_POLICY
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        if request.is_secure:
            response.headers["Strict-Transport-Security"] = "max-age=31536000"
        if request.path.startswith("/admin"):
            response.headers["Cache-Control"] = "no-store"
        return response

    @app.errorhandler(400)
    @app.errorhandler(403)
    @app.errorhandler(413)
    @app.errorhandler(429)
    @app.errorhandler(503)
    def show_error(error):
        messages = {
            400: "That request could not be understood.",
            403: "That request was blocked for security reasons.",
            413: "That request was too large.",
            429: "Too many attempts. Please wait a while and try again.",
            503: "The admin area is not set up yet.",
        }
        return render_template("error.html", messages=[messages.get(error.code, "Something went wrong.")]), error.code

    # ---------- public routes ----------
    @app.get("/")
    def home():
        return app.send_static_file("index.html")

    @app.post("/join")
    def join():
        require_same_origin()
        if not limiter.allow(f"join:{request.remote_addr}", 10, 3600):
            abort(429)

        if request.form.get("website"):  # honeypot: real people leave this empty
            return redirect("/thanks.html")

        full_name = clean(request.form.get("fullname"), 80)
        email = clean(request.form.get("email"), 254).lower()
        level = request.form.get("level", "")
        day = request.form.get("day", "")
        interests = [item for item in request.form.getlist("interests") if item in INTERESTS]
        comments = clean(request.form.get("comments"), 500)

        problems = []
        if not full_name or re.search(r"[<>]", request.form.get("fullname", "")):
            problems.append("Please enter your name without the < or > characters.")
        if not EMAIL_PATTERN.match(email):
            problems.append("Please enter a valid email address.")
        if level not in LEVELS:
            problems.append("Please choose your hiking experience.")
        if day not in DAYS:
            problems.append("Please choose a preferred hiking day.")
        if problems:
            return render_template("error.html", messages=problems), 400

        try:
            db = get_db()
            db.execute(
                "INSERT INTO members (full_name, email, level, preferred_day, interests, comments) "
                "VALUES (?, ?, ?, ?, ?, ?)",
                (full_name, email, level, day, ", ".join(interests), comments),
            )
            db.commit()
        except sqlite3.IntegrityError:
            pass  # already registered: respond the same way so emails cannot be probed

        return redirect("/thanks.html?" + urlencode({"fullname": full_name, "level": level}))

    # ---------- admin routes ----------
    @app.route("/admin/login", methods=["GET", "POST"])
    def admin_login():
        if not app.config["ADMIN_PASSWORD"]:
            abort(503)
        if request.method == "POST":
            require_same_origin()
            if not limiter.allow(f"login:{request.remote_addr}", 10, 900):
                abort(429)
            supplied = request.form.get("password", "").encode()
            expected = app.config["ADMIN_PASSWORD"].encode()
            if hmac.compare_digest(supplied, expected):
                session.clear()
                session["admin"] = True
                session.permanent = True
                return redirect(url_for("admin_dashboard"))
            return render_template("admin_login.html", failed=True), 401
        return render_template("admin_login.html", failed=False)

    @app.get("/admin")
    @admin_required
    def admin_dashboard():
        db = get_db()
        members = db.execute("SELECT * FROM members ORDER BY id DESC").fetchall()
        counts = {level: 0 for level in LEVELS}
        for row in db.execute("SELECT level, COUNT(*) AS total FROM members GROUP BY level"):
            counts[row["level"]] = row["total"]
        return render_template("admin.html", members=members, counts=counts, total=len(members))

    @app.get("/admin/export.csv")
    @admin_required
    def admin_export():
        rows = get_db().execute("SELECT * FROM members ORDER BY id").fetchall()
        buffer = io.StringIO()
        writer = csv.writer(buffer)
        writer.writerow(["id", "joined_utc", "name", "email", "experience", "preferred_day", "interests", "comments"])
        for row in rows:
            writer.writerow([
                spreadsheet_safe(value) for value in (
                    row["id"], row["created_at"], row["full_name"], row["email"],
                    row["level"], row["preferred_day"], row["interests"], row["comments"],
                )
            ])
        return Response(
            buffer.getvalue(),
            mimetype="text/csv",
            headers={"Content-Disposition": "attachment; filename=trailmate-members.csv"},
        )

    @app.post("/admin/logout")
    def admin_logout():
        require_same_origin()
        session.clear()
        return redirect(url_for("admin_login"))

    return app


if __name__ == "__main__":
    create_app().run(debug=os.environ.get("FLASK_DEBUG") == "1")
