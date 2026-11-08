# TrailMate Hiking Club: Flask backend

A small Flask and SQLite backend for the TrailMate website. It serves the static site from `site/`, saves join-form signups, and has a password-protected admin page.

## Run it on your computer (Windows)

1. Open a terminal in this folder.
2. Create and start a virtual environment:
   ```
   python -m venv .venv
   .venv\Scripts\activate
   ```
3. Install the packages:
   ```
   pip install -r requirements.txt
   ```
4. Copy `.env.example` to `.env`. Set `SECRET_KEY` to a long random string and `ADMIN_PASSWORD` to a strong password. If the admin login does not work on `http://localhost`, set `COOKIE_SECURE=0`.
5. Start the site:
   ```
   python app.py
   ```
6. Open `http://localhost:5000`. Submit the join form, then open `http://localhost:5000/admin/login`.

## Run the tests

```
python -m unittest tests.test_app -v
```

## What it does

| Route | Purpose |
|---|---|
| `GET /` and every file in `site/` | The TrailMate website |
| `POST /join` | Validates a signup and saves it to the `members` table |
| `GET /admin/login`, `POST /admin/login` | Admin login |
| `GET /admin` | Member list with counts by experience level |
| `GET /admin/export.csv` | Download all members as CSV |
| `POST /admin/logout` | Log out |

## Security built in

- All database queries use `?` placeholders, so form text cannot change the SQL.
- Admin pages use Jinja templates, which escape HTML, so a malicious comment is shown as text.
- Server-side validation of every field, with allow-lists for experience, day and interests.
- Origin check on every POST, a hidden honeypot field, and rate limits on signups and logins.
- Password check with a constant-time comparison. The password and secret come from environment variables, never from the code.
- Admin session cookie is HttpOnly, SameSite=Lax and Secure, and expires after 2 hours.
- Security headers on every response: Content Security Policy, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, referrer policy, and HSTS over HTTPS.
- CSV export neutralizes cells that start with `=`, `+`, `-` or `@`.
- The database and source code sit outside `site/`, so they cannot be downloaded.

## Deploying

GitHub Pages cannot run Flask, so the whole app needs a Python host.

- **PythonAnywhere (free):** keeps the SQLite file between restarts. Upload the folder, create a Flask web app that points to `app.py`, and set `SECRET_KEY`, `ADMIN_PASSWORD` and `TRUST_PROXY=1` as environment variables.
- **Render:** start command `gunicorn --workers 1 "app:create_app()"`. The free tier loses the SQLite file on each redeploy unless you add a paid persistent disk.

Use one worker, because the rate limits are counted in memory.

## Known limits

- One admin password, no individual accounts.
- Rate limits reset when the server restarts.
- SQLite is fine for a club site but not for heavy traffic.
- Back up `data/trailmate.db` regularly, because it holds personal information. Handle it according to your local privacy law (POPIA in South Africa).
