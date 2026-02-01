import time
import random
import requests
import os
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer
from datetime import datetime
import pytz

# ================= CONFIG =================
# রেন্ডার এনভায়রনমেন্ট থেকে টোকেন নেবে, না পেলে ডিফল্টটা ব্যবহার করবে
BOT_TOKEN = os.environ.get('BOT_TOKEN', '8281243098:AAFf4wdCowXR6ent0peu7ngL_GYW7dXPqY8')
CHAT_ID = os.environ.get('CHAT_ID', '@TWS_Teams')
API_URL = "https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json"

WIN_STK = "CAACAgUAAxkBAAMJaVaqlqfj3ezjjCGTEsZrhwbxTyAAAqQaAAI4ZQlVFQAB7e-5iBcyOAQ"
LOSS_STK = "CAACAgUAAxkBAAMKaVaqlwtXJIhkqunkRi-DkH0LP_cAAuAeAAJ1FQhVCo9WKmwYFIw4BA"

last_period = None
prediction_history = []

# ================= RENDER PORT FIX (HEALTH CHECK) =================
class HealthCheckHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"Bot is Running")

def run_health_server():
    # রেন্ডার সাধারণত ১০০০০ বা ৩০০০ পোর্টে চেক করে
    port = int(os.environ.get("PORT", 10000))
    server = HTTPServer(('0.0.0.0', port), HealthCheckHandler)
    print(f"✅ Health Check Server started on port {port}")
    server.serve_forever()

# ================= UTILS =================
def send_tg(method, data):
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/{method}"
    try:
        requests.post(url, json={"chat_id": CHAT_ID, **data}, timeout=10)
    except Exception as e:
        print(f"❌ TG Error: {e}")

# ================= MAIN BOT LOGIC =================
def start_monitoring():
    global last_period
    print("🚀 SAIF 1M Bot Monitoring Started...")
    
    while True:
        try:
            # API থেকে লেটেস্ট ডাটা আনা
            res = requests.get(f"{API_URL}?ts={int(time.time()*1000)}", timeout=15)
            data = res.json()
            
            list_data = data.get("data", {}).get("list", [])
            if not list_data:
                time.sleep(10)
                continue

            current = list_data[0]
            current_p = str(current.get("issue") or current.get("issueNumber"))
            next_p = str(int(current_p) + 1)

            if last_period != next_p:
                # ১. আগের রেজাল্ট চেক করে স্টিকার পাঠানো
                if prediction_history:
                    last_pred = prediction_history[0]
                    num = int(str(current.get("number") or current.get("result"))[-1])
                    actual = "BIGG" if num >= 5 else "SMALL"
                    
                    stk = WIN_STK if last_pred['p'] == actual else LOSS_STK
                    send_tg("sendSticker", {"sticker": stk})

                # ২. ১০ সেকেন্ড অপেক্ষা (API সিঙ্ক হওয়ার জন্য)
                time.sleep(10)

                # ৩. নতুন প্রেডিকশন পাঠানো
                pred = random.choice(["BIGG", "SMALL"])
                dhaka_tz = pytz.timezone('Asia/Dhaka')
                now = datetime.now(dhaka_tz).strftime("%I:%M %p")

                msg = (f"🎰 <b>WINGO 1M MARKET</b>\n"
                       f"📊 <b>PERIOD:</b> <code>{next_p}</code>\n"
                       f"⏰ <b>Time:</b> {now}\n"
                       f"🎯 <b>BUY:</b> {'🔴 BIGG' if pred == 'BIGG' else '🟢 SMALL'}\n\n"
                       f"⚡️<b>THIS SIGNAL PROVIDED BY TWS TEAM</b>⚡️")

                send_tg("sendMessage", {"text": msg, "parse_mode": "HTML"})
                
                # হিস্ট্রিতে সেভ রাখা
                prediction_history.insert(0, {'p': pred})
                last_period = next_p
                if len(prediction_history) > 5: prediction_history.pop()
                print(f"✅ Prediction sent for {next_p}")

        except Exception as e:
            print(f"⚠️ Syncing API...")
        
        time.sleep(20) # ২০ সেকেন্ড পর পর চেক

# ================= EXECUTION =================
if __name__ == "__main__":
    # হেলথ চেক সার্ভারটি আলাদা থ্রেডে চালানো যাতে বটের কাজে বাধা না দেয়
    threading.Thread(target=run_health_server, daemon=True).start()
    # মেইন বট প্রসেস শুরু
    start_monitoring()
