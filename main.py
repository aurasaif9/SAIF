import time
import random
import requests
import os
from datetime import datetime
import pytz

# ================= CONFIG =================
BOT_TOKEN = os.environ.get('BOT_TOKEN', '8281243098:AAFf4wdCowXR6ent0peu7ngL_GYW7dXPqY8')
CHAT_ID = os.environ.get('CHAT_ID', '@TWS_Teams')
API_URL = "https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json"

WIN_STK = "CAACAgUAAxkBAAMJaVaqlqfj3ezjjCGTEsZrhwbxTyAAAqQaAAI4ZQlVFQAB7e-5iBcyOAQ"
LOSS_STK = "CAACAgUAAxkBAAMKaVaqlwtXJIhkqunkRi-DkH0LP_cAAuAeAAJ1FQhVCo9WKmwYFIw4BA"

last_period = None
prediction_history = []

def send_tg(method, data):
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/{method}"
    try:
        requests.post(url, json={"chat_id": CHAT_ID, **data}, timeout=10)
    except:
        print("Telegram communication failed")

def run_bot():
    global last_period
    print("🚀 SAIF 1M Python Bot is Monitoring API...")
    
    while True:
        try:
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
                # ফলাফল পরীক্ষা
                if prediction_history:
                    last_pred = prediction_history[0]
                    num = int(str(current.get("number") or current.get("result"))[-1])
                    actual = "BIGG" if num >= 5 else "SMALL"
                    
                    stk = WIN_STK if last_pred['p'] == actual else LOSS_STK
                    send_tg("sendSticker", {"sticker": stk})

                time.sleep(10) # ১০ সেকেন্ড সিঙ্ক ওয়েট

                # নতুন সিগন্যাল
                pred = random.choice(["BIGG", "SMALL"])
                dhaka_tz = pytz.timezone('Asia/Dhaka')
                now = datetime.now(dhaka_tz).strftime("%I:%M %p")

                msg = (f"🎰 <b>WINGO 1M MARKET</b>\n"
                       f"📊 <b>PERIOD:</b> <code>{next_p}</code>\n"
                       f"⏰ <b>Time:</b> {now}\n"
                       f"🎯 <b>BUY:</b> {'🔴 BIGG' if pred == 'BIGG' else '🟢 SMALL'}\n\n"
                       f"⚡️<b>THIS SIGNAL PROVIDED BY TWS TEAM</b>⚡️")

                send_tg("sendMessage", {"text": msg, "parse_mode": "HTML"})
                
                prediction_history.insert(0, {'p': pred})
                last_period = next_p
                if len(prediction_history) > 5: prediction_history.pop()

        except Exception as e:
            print(f"Waiting for API sync...")
        
        time.sleep(20)

if __name__ == "__main__":
    run_bot()
