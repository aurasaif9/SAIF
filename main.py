import time
import random
import requests
import os
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer
from datetime import datetime
import pytz

# ================= CONFIG =================
# টোকেন আর আইডি সরাসরি এখানে বসিয়ে দিচ্ছি যেন ভুল না হয়
BOT_TOKEN = "8281243098:AAFf4wdCowXR6ent0peu7ngL_GYW7dXPqY8"
CHAT_ID = "@TWS_Teams" 
API_URL = "https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json"

last_period = None

# ================= RENDER HEALTH CHECK =================
class HealthCheckHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"OK")

def run_health_server():
    port = int(os.environ.get("PORT", 10000))
    server = HTTPServer(('0.0.0.0', port), HealthCheckHandler)
    server.serve_forever()

# ================= TELEGRAM SEND =================
def send_msg(text):
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    try:
        payload = {"chat_id": CHAT_ID, "text": text, "parse_mode": "HTML"}
        r = requests.post(url, json=payload, timeout=10)
        print(f"📡 TG Response: {r.text}")
    except Exception as e:
        print(f"❌ TG Error: {e}")

# ================= MAIN LOGIC =================
def start_bot():
    global last_period
    print("🚀 Prediction Loop Started...")
    
    # শুরুতে একটা টেস্ট মেসেজ দিবে দেখার জন্য যে সব ঠিক আছে কি না
    send_msg("✨ <b>SAIF BOT IS NOW ONLINE!</b>\nMonitoring WinGo 1M...")

    while True:
        try:
            # API রিকোয়েস্ট
            res = requests.get(f"{API_URL}?ts={int(time.time()*1000)}", timeout=15)
            data = res.json()
            
            list_data = data.get("data", {}).get("list", [])
            if not list_data:
                print("⚠️ No data from API, retrying...")
                time.sleep(10)
                continue

            current = list_data[0]
            current_p = str(current.get("issue") or current.get("issueNumber"))
            next_p = str(int(current_p) + 1)

            print(f"📊 Current Period: {current_p} | Next: {next_p}")

            if last_period != next_p:
                # প্রেডিকশন তৈরি
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
            print(f"❌ Loop Error: {e}")
        
        time.sleep(15)

if __name__ == "__main__":
    threading.Thread(target=run_health_server, daemon=True).start()
    start_bot()
