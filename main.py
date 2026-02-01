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

# ================= HEALTH CHECK =================
class HealthCheckHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"SERVER_OK")

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

# ================= PREDICTION ENGINE =================
def start_bot():
    global last_period
    print("🚀 Prediction engine is searching for data...")
    
    while True:
        try:
            # API থেকে ডাটা আনা (Cache এড়াতে টাইমস্ট্যাম্পসহ)
            res = requests.get(f"{API_URL}?ts={int(time.time()*1000)}", timeout=10, headers={'User-Agent': 'Mozilla/5.0'})
            data = res.json()
            
            # ডাটা স্ট্রাকচার চেক
            list_data = data.get("data", {}).get("list", [])
            if not list_data:
                print("☁️ API logic: Waiting for list data...")
                time.sleep(5)
                continue

            # বর্তমান পিরিয়ড বের করা
            current_item = list_data[0]
            current_p = str(current_item.get("issue") or current_item.get("issueNumber"))
            
            # পরবর্তী পিরিয়ড ক্যালকুলেট করা
            next_p = str(int(current_p) + 1)

            # যদি নতুন পিরিয়ড পাওয়া যায়
            if last_period != next_p:
                print(f"🎯 New Period Detected: {next_p}")
                
                # প্রেডিকশন জেনারেট
                pred = random.choice(["BIGG", "SMALL"])
                dhaka_tz = pytz.timezone('Asia/Dhaka')
                now = datetime.now(dhaka_tz).strftime("%I:%M %p")

                msg = (f"🎰 <b>WINGO 1M</b>\n"
                       f"📊 <b>PERIOD:</b> <code>{next_p}</code>\n"
                       f"⏰ <b>TIME:</b> {now}\n"
                       f"🎯 <b>BUY:</b> {'🔴 BIGG' if pred == 'BIGG' else '🟢 SMALL'}\n\n"
                       f"⚡️<b>PROVIDED BY TWS TEAM</b>")

                send_msg(msg)
                last_period = next_p
                print(f"✅ Message sent for {next_p}")

        except Exception as e:
            print(f"⚠️ Tracking issue: {e}")
        
        time.sleep(5) # প্রতি ৫ সেকেন্ডে ডাটা চেক করবে

if __name__ == "__main__":
    threading.Thread(target=run_health_server, daemon=True).start()
    start_bot()
