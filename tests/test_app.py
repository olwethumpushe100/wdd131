import os
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app import create_app

ORIGIN = {"Origin": "http://localhost"}
GOOD = {
    "fullname": "Thandi Nkosi", "email": "Thandi@Example.com", "level": "beginner",
    "day": "Saturday", "interests": ["Day hikes", "Photography"], "comments": "Looking forward to it",
}


class TrailMateTests(unittest.TestCase):
    def setUp(self):
        self.folder = tempfile.TemporaryDirectory()
        self.app = create_app({
            "TESTING": True,
            "DATABASE": os.path.join(self.folder.name, "test.db"),
            "ADMIN_PASSWORD": "correct horse",
            "SECRET_KEY": "test-secret",
            "SESSION_COOKIE_SECURE": False,
        })
        self.client = self.app.test_client()

    def tearDown(self):
        self.folder.cleanup()

    def login(self):
        return self.client.post("/admin/login", data={"password": "correct horse"}, headers=ORIGIN)

    def test_static_site_and_security_headers(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("frame-ancestors 'none'", response.headers["Content-Security-Policy"])
        self.assertEqual(response.headers["X-Content-Type-Options"], "nosniff")
        self.assertEqual(response.headers["X-Frame-Options"], "DENY")
        self.assertEqual(self.client.get("/trails.html").status_code, 200)

    def test_database_file_is_not_served(self):
        self.assertEqual(self.client.get("/data/test.db").status_code, 404)
        self.assertEqual(self.client.get("/app.py").status_code, 404)
        self.assertEqual(self.client.get("/schema.sql").status_code, 404)

    def test_valid_signup_is_saved_and_redirects(self):
        response = self.client.post("/join", data=GOOD, headers=ORIGIN)
        self.assertEqual(response.status_code, 302)
        self.assertIn("/thanks.html?", response.headers["Location"])
        self.assertNotIn("email", response.headers["Location"])
        self.login()
        page = self.client.get("/admin").get_data(as_text=True)
        self.assertIn("Thandi Nkosi", page)
        self.assertIn("thandi@example.com", page)

    def test_duplicate_email_gives_same_response_and_one_row(self):
        first = self.client.post("/join", data=GOOD, headers=ORIGIN)
        second = self.client.post("/join", data=GOOD, headers=ORIGIN)
        self.assertEqual(first.status_code, second.status_code)
        self.login()
        csv_text = self.client.get("/admin/export.csv").get_data(as_text=True)
        self.assertEqual(csv_text.count("thandi@example.com"), 1)

    def test_invalid_input_is_rejected(self):
        for change in ({"email": "not-an-email"}, {"level": "expert"}, {"day": "Monday"}, {"fullname": "<script>x</script>"}, {"fullname": ""}):
            data = {**GOOD, **change}
            self.assertEqual(self.client.post("/join", data=data, headers=ORIGIN).status_code, 400, change)

    def test_cross_site_post_is_blocked(self):
        self.assertEqual(self.client.post("/join", data=GOOD).status_code, 403)
        self.assertEqual(self.client.post("/join", data=GOOD, headers={"Origin": "http://evil.example"}).status_code, 403)

    def test_honeypot_saves_nothing(self):
        self.client.post("/join", data={**GOOD, "website": "http://spam.example"}, headers=ORIGIN)
        self.login()
        self.assertIn("No one has joined yet", self.client.get("/admin").get_data(as_text=True))

    def test_join_rate_limit(self):
        codes = [
            self.client.post("/join", data={**GOOD, "email": f"p{i}@example.com"}, headers=ORIGIN).status_code
            for i in range(12)
        ]
        self.assertEqual(codes[:10], [302] * 10)
        self.assertEqual(codes[10:], [429, 429])

    def test_admin_requires_login(self):
        self.assertEqual(self.client.get("/admin").status_code, 302)
        self.assertEqual(self.client.get("/admin/export.csv").status_code, 302)

    def test_wrong_password_and_lockout(self):
        for _ in range(10):
            response = self.client.post("/admin/login", data={"password": "wrong"}, headers=ORIGIN)
            self.assertEqual(response.status_code, 401)
        self.assertEqual(self.client.post("/admin/login", data={"password": "correct horse"}, headers=ORIGIN).status_code, 429)

    def test_login_and_logout(self):
        self.assertEqual(self.login().status_code, 302)
        self.assertEqual(self.client.get("/admin").status_code, 200)
        self.client.post("/admin/logout", headers=ORIGIN)
        self.assertEqual(self.client.get("/admin").status_code, 302)

    def test_admin_page_escapes_html_in_comments(self):
        self.client.post("/join", data={**GOOD, "comments": "<img src=x onerror=alert(1)>"}, headers=ORIGIN)
        self.login()
        page = self.client.get("/admin").get_data(as_text=True)
        self.assertNotIn("<img src=x", page)
        self.assertIn("&lt;img", page)

    def test_csv_blocks_formula_injection(self):
        self.client.post("/join", data={**GOOD, "comments": "=HYPERLINK(\"http://evil\")"}, headers=ORIGIN)
        self.login()
        csv_text = self.client.get("/admin/export.csv").get_data(as_text=True)
        self.assertIn("'=HYPERLINK", csv_text)

    def test_admin_disabled_without_password(self):
        app = create_app({"TESTING": True, "DATABASE": os.path.join(self.folder.name, "x.db"), "ADMIN_PASSWORD": ""})
        self.assertEqual(app.test_client().get("/admin").status_code, 503)


if __name__ == "__main__":
    unittest.main()
