import time
import random
import requests
import os
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer
from datetime import datetime
import pytz

# ================= CONFIG =================
BOT_TOKEN = "8281243098:AAFf4wdCowXR6ent0peu7ngL_GYW7dXPqY8"
CHAT_ID = "@TWS_Teams" 
API_URL = "https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json"

last_period = None

# ================= HEALTH CHECK (RENDER) =================
class HealthCheckHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"ONLINE")

def run_health_server():
    port = int(os.environ.get("PORT", 10000))
    server = HTTPServer(('0.0.0.0', port), HealthCheckHandler)
    server.serve_forever()

# ================= TELEGRAM SEND =================
def send_msg(text):
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    try:
        requests.post(url, json={"chat_id": CHAT_ID, "text": text, "parse_mode": "HTML"}, timeout=10)
    except: pass

# ================= BOT ENGINE =================
def start_bot():
    global last_period
    print("🚀 Monitoring API for new periods...")
    
    # এটি কনফার্ম করবে যে কানেকশন ঠিক আছে
    send_msg("🔄 <b>SAIF BOT:</b> API Tracking Started. Waiting for new period...")

    while True:
        try:
            # API থেকে ডাটা ফেচ করা
            res = requests.get(f"{API_URL}?ts={int(time.time()*1000)}", timeout=10)
            data = res.json()
            
            list_data = data.get("data", {}).get("list", [])
            if not list_data:
                time.sleep(5)
                continue

            current_p = str(list_data[0].get("issue") or list_data[0].get("issueNumber"))
            next_p = str(int(current_p) + 1)

            # যদি নতুন পিরিয়ড ডিটেক্ট হয়
            if last_period != next_p:
                print(f"🆕 New Period Detected: {next_p}")
                
                # ৫ সেকেন্ড ওয়েট (রেজাল্ট সিঙ্ক হওয়ার জন্য)
                time.sleep(5)

                pred = random.choice(["BIGG", "SMALL"])
                now = datetime.now(pytz.timezone('Asia/Dhaka')).strftime("%I:%M %p")

                msg = (f"🎰 <b>WINGO 1M</b>\n"
                       f"📊 <b>PERIOD:</b> <code>{next_p}</code>\n"
                       f"⏰ <b>TIME:</b> {now}\n"
                       f"🎯 <b>BUY:</b> {'🔴 BIGG' if pred == 'BIGG' else '🟢 SMALL'}\n\n"
                       f"⚡️<b>PROVIDED BY TWS TEAM</b>")

                send_msg(msg)
                last_period = next_p
                print(f"✅ Prediction Sent for {next_p}")

        except Exception as e:
            print(f"⚠️ API Sync Issue, retrying...")
        
        time.sleep(10) # প্রতি ১০ সেকেন্ডে চেক করবে

if __name__ == "__main__":
    threading.Thread(target=run_health_server, daemon=True).start()
    start_bot()
