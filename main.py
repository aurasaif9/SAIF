"""
AURA X TEAM Wingo Bot — Render Web Service Runner
Checks every 15 seconds + keeps an HTTP port open for Render free tier
"""
import time, os, threading
from http.server import BaseHTTPRequestHandler, HTTPServer
from wingo_bot import run

# ─── Tiny HTTP server (Render free tier port binding er jonno) ──────────
class HealthHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.end_headers()
        self.wfile.write(b"AURA X TEAM Bot is running ")

    def log_message(self, format, *args):
        return  # silent logs

def start_http_server():
    port = int(os.environ.get("PORT", 10000))
    server = HTTPServer(("0.0.0.0", port), HealthHandler)
    print(f" HTTP server listening on port {port}")
    server.serve_forever()

# Start HTTP server in background thread
threading.Thread(target=start_http_server, daemon=True).start()

# ─── Main bot loop ──────────────────────────────────────────────────────
print(" AURA X TEAM Bot started on Render!")
print(" Checking every 15 seconds...")

while True:
    try:
        run()
    except Exception as e:
        print(f" Error: {e}")
    time.sleep(15)
