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

# ================= FIXING 501 ERROR (HEALTH CHECK) =================
class HealthCheckHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"SERVER_OK")
    
    # এই অংশটুকু 501 এরর বন্ধ করবে
    def do_HEAD(self):
        self.send_response(200)
        self.end_headers()

def run_health_server():
    port = int(os.environ.get("PORT", 10000))
    server = HTTPServer(('0.0.0.0', port), HealthCheckHandler)
    print(f"✅ Health Check Server on port {port}")
    server.serve_forever()

# ================= TELEGRAM SEND =================
def send_msg(text):
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    try:
        requests.post(url, json={"chat_id": CHAT_ID, "text": text, "parse_mode": "HTML"}, timeout=10)
    except: pass

# ================= PREDICTION ENGINE =================
def start_bot():
    global last_period
    print("🚀 Prediction engine active...")
    
    while True:
        try:
            # API রিকোয়েস্ট (Browser Agent যোগ করা হয়েছে যেন ব্লক না করে)
            headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
            res = requests.get(f"{API_URL}?ts={int(time.time()*1000)}", timeout=10, headers=headers)
            data = res.json()
            
            list_data = data.get("data", {}).get("list", [])
            if not list_data:
                time.sleep(5)
                continue

            # বর্তমান ডাটা
            current_item = list_data[0]
            # issue বা issueNumber যেকোনো একটা পেলেই হবে
            current_p = str(current_item.get("issue") or current_item.get("issueNumber"))
            next_p = str(int(current_p) + 1)

            if last_period != next_p:
                print(f"🎯 New Period Detected: {next_p}")
                
                # ৫ সেকেন্ড রিল্যাক্স যেন API আপডেট হয়
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
                print(f"✅ Sent: {next_p}")

        except Exception as e:
            print(f"⚠️ Tracking...")
        
        time.sleep(5) 

if __name__ == "__main__":
    threading.Thread(target=run_health_server, daemon=True).start()
    start_bot()
