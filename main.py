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
        requests.post(url, json={"chat_id": CHAT_ID, **data})
    except:
        print("Telegram error")

def run_bot():
    global last_period
    while True:
        try:
            # API থেকে ডেটা আনা
            res = requests.get(f"{API_URL}?ts={int(time.time()*1000)}", timeout=10)
            data = res.json()
            
            list_data = data.get("data", {}).get("list", [])
            if not list_data:
                time.sleep(10)
                continue

            current = list_data[0]
            current_p = str(current.get("issue") or current.get("issueNumber"))
            next_p = str(int(current_p) + 1)

            if last_period != next_p:
                # আগের প্রেডিকশন উইন না লস চেক
                if prediction_history:
                    last_pred = prediction_history[0]
                    num = int(str(current.get("number") or current.get("result"))[-1])
                    actual = "BIGG" if num >= 5 else "SMALL"
                    
                    stk = WIN_STK if last_pred['p'] == actual else LOSS_STK
                    send_tg("sendSticker", {"sticker": stk})

                # ১০ সেকেন্ড ওয়েট
                print(f"New Period Detected: {next_p}. Waiting 10s...")
                time.sleep(10)

                # নতুন প্রেডিকশন
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
            print(f"Loop error: {e}")
        
        time.sleep(15) # ১৫ সেকেন্ড পর পর চেক করবে

if __name__ == "__main__":
    print("🚀 SAIF 1M Python Bot is Live!")
    run_bot()
    });
    
    const text = await response.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {
      console.log("Waiting for valid API data...");
      isProcessing = false;
      return;
    }

    const list = json?.data?.list || [];
    if (list.length === 0) {
      isProcessing = false;
      return;
    }

    const current = list[0];
    const currentPeriod = current.issue || current.issueNumber;
    const nextPeriod = (BigInt(currentPeriod) + 1n).toString();

    if (lastPeriod !== nextPeriod) {
      // আগের প্রেডিকশন চেক
      if (history.length > 0 && history[0].actual === null) {
        const num = parseInt(String(current.number || current.result).slice(-1));
        const actualType = num >= 5 ? "BIGG" : "SMALL";
        const isWin = history[0].predicted === actualType;
        await sendTG("sendSticker", { sticker: isWin ? WIN_STK : LOSS_STK });
      }

      await sleep(10000); // ১০ সেকেন্ড অপেক্ষা

      const prediction = Math.random() > 0.5 ? "BIGG" : "SMALL";
      const time = new Date().toLocaleTimeString("en-US", { hour12: true, timeZone: 'Asia/Dhaka' });

      const message = `🎰 <b>WINGO 1M MARKET</b>\n` +
                      `📊 <b>PERIOD:</b> <code>${nextPeriod}</code>\n` +
                      `⏰ <b>Time:</b> ${time}\n` +
                      `🎯 <b>BUY:</b> ${prediction === "BIGG" ? "🔴 BIGG" : "🟢 SMALL"}\n\n` +
                      `⚡️<b>THIS SIGNAL PROVIDED BY TWS TEAM</b>⚡️`;

      await sendTG("sendMessage", { text: message, parse_mode: "HTML" });
      
      history.unshift({ period: nextPeriod, predicted: prediction, actual: null });
      lastPeriod = nextPeriod;
      if (history.length > 5) history.pop();
    }
  } catch (err) {
    console.log("Processing update...");
  } finally {
    isProcessing = false;
  }
}

// ================= START SERVER (RENDER FIX) =================
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('SAIF 1M BOT IS ACTIVE');
}).listen(process.env.PORT || 3000);

console.log("🚀 Bot is starting... Tracking WinGo 1M!");
setInterval(runBot, 20000);
    });
    
    const text = await response.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {
      isProcessing = false;
      return;
    }

    const list = json?.data?.list || [];
    if (list.length === 0) {
      isProcessing = false;
      return;
    }

    const current = list[0];
    const currentPeriod = current.issue || current.issueNumber;
    const nextPeriod = (BigInt(currentPeriod) + 1n).toString();

    if (lastPeriod !== nextPeriod) {
      // Result check for previous prediction
      if (history.length > 0 && history[0].actual === null) {
        const num = parseInt(String(current.number || current.result).slice(-1));
        const actualType = num >= 5 ? "BIGG" : "SMALL";
        const isWin = history[0].predicted === actualType;
        await sendTG("sendSticker", { sticker: isWin ? WIN_STK : LOSS_STK });
      }

      await sleep(10000); // 10s wait for Telegram sync

      const prediction = Math.random() > 0.5 ? "BIGG" : "SMALL";
      const time = new Date().toLocaleTimeString("en-US", { hour12: true, timeZone: 'Asia/Dhaka' });

      const message = `🎰 <b>WINGO 1M MARKET</b>\n` +
                      `📊 <b>PERIOD:</b> <code>${nextPeriod}</code>\n` +
                      `⏰ <b>Time:</b> ${time}\n` +
                      `🎯 <b>BUY:</b> ${prediction === "BIGG" ? "🔴 BIGG" : "🟢 SMALL"}\n\n` +
                      `⚡️<b>THIS SIGNAL PROVIDED BY TWS TEAM</b>⚡️`;

      await sendTG("sendMessage", { text: message, parse_mode: "HTML" });
      
      history.unshift({ period: nextPeriod, predicted: prediction, actual: null });
      lastPeriod = nextPeriod;
      if (history.length > 5) history.pop();
    }
  } catch (err) {
    console.log("Error in loop");
  } finally {
    isProcessing = false;
  }
}

// ================= START SERVER =================
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('SAIF 1M BOT IS LIVE');
}).listen(process.env.PORT || 3000);

console.log("🚀 Bot Started! Tracking WinGo 1M...");
setInterval(runBot, 20000);

    const data = j?.data?.list || [];
    if (!data.length) { processing = false; return; }

    const cur = data[0];
    const curP = cur.issue || cur.issueNumber;
    const nextP = (BigInt(curP) + 1n).toString();

    if (lastPeriod !== nextP) {
      if (history.length > 0 && history[0].actual === null) {
        const resNum = parseInt(String(cur.number || cur.result).slice(-1));
        const resType = resNum >= 5 ? "BIGG" : "SMALL";
        await callTG("sendSticker", { sticker: history[0].predicted === resType ? WIN_STK : LOSS_STK });
      }
      
      await sleep(10000); // 10s Delay
      const p = Math.random() > 0.5 ? "BIGG" : "SMALL";
      const time = new Date().toLocaleTimeString("en-US", { hour12: true, timeZone: 'Asia/Dhaka' });
      
      const msg = `🎰 <b>WINGO 1M</b>\n📊 <b>PERIOD:</b> <code>${nextP}</code>\n⏰ <b>TIME:</b> ${time}\n🎯 <b>BUY:</b> ${p === "BIGG" ? "🔴 BIGG" : "🟢 SMALL"}`;
      
      await callTG("sendMessage", { text: msg, parse_mode: "HTML" });
      history.unshift({ period: nextP, predicted: p, actual: null });
      lastPeriod = nextP;
      if (history.length > 5) history.pop();
    }
  } catch (e) { console.log("Loop Error"); }
  processing = false;
}

// --- START ---
http.createServer((q, s) => s.end("Bot Active")).listen(process.env.PORT || 3000);
setInterval(runLogic, 20000);
console.log("🚀 Bot Running...");
    const data = j?.data?.list || [];
    if (!data.length) { isProcessing = false; return; }

    const cur = data[0];
    const currentPeriod = cur.issue || cur.issueNumber;
    const nextPeriod = (BigInt(currentPeriod) + 1n).toString();

    if (lastPredictedPeriod !== nextPeriod) {
      if (predictionHistory.length > 0 && predictionHistory[0].actual === null) {
        const actualRes = parseInt(String(cur.number || cur.result).slice(-1)) >= 5 ? "BIGG" : "SMALL";
        await sendToTelegram(predictionHistory[0].predicted === actualRes ? WIN_STICKER : LOSS_STICKER, true);
      }
      await sleep(10000); 
      const p = Math.random() > 0.5 ? "BIGG" : "SMALL";
      const msg = `🎰 <b>WINGO 1M</b>\n📊 <b>PERIOD:</b> ${nextPeriod}\n🎯 <b>BUY:</b> ${p === "BIGG" ? "🔴 BIGG" : "🟢 SMALL"}`;
      await sendToTelegram(msg);
      predictionHistory.unshift({ period: nextPeriod, predicted: p, actual: null });
      lastPredictedPeriod = nextPeriod;
      if (predictionHistory.length > 5) predictionHistory.pop();
    }
  } catch (err) { console.log(err.message); }
  isProcessing = false;
}

http.createServer((req, res) => { res.end('Running'); }).listen(process.env.PORT || 3000);
setInterval(updatePanel, 20000);
console.log("🚀 Started!");
