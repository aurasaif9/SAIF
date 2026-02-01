import fetch from "node-fetch";
import os from "os";
import http from "http";

// ================= CONFIG (Fixed) =================
const USER_NAME = "SAIF";      // এখানে তোর নাম ফিক্সড
const USER_COUNTRY = "BD";     // এখানে তোর দেশ ফিক্সড
const TELEGRAM_BOT_TOKEN = "8281243098:AAFf4wdCowXR6ent0peu7ngL_GYW7dXPqY8"; 
const TELEGRAM_CHAT_ID = "@TWS_Teams"; 

const WIN_STICKER = "CAACAgUAAxkBAAMJaVaqlqfj3ezjjCGTEsZrhwbxTyAAAqQaAAI4ZQlVFQAB7e-5iBcyOAQ";
const LOSS_STICKER = "CAACAgUAAxkBAAMKaVaqlwtXJIhkqunkRi-DkH0LP_cAAuAeAAJ1FQhVCo9WKmwYFIw4BA";
const API_URL = "https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json";
const REFRESH_TIME = 15000; 

// ================= GLOBAL =================
let predictionHistory = [];
let lastPredictedPeriod = null;

// ================= TELEGRAM FUNCTION =================
async function sendToTelegram(message, isSticker = false) {
  try {
    const type = isSticker ? "sendSticker" : "sendMessage";
    const bodyKey = isSticker ? "sticker" : "text";
    
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        [bodyKey]: message,
        parse_mode: isSticker ? null : "HTML"
      })
    });
  } catch (e) { console.log("TG Error: " + e.message); }
}

// ================= LOGIC =================
function getPatternPrediction() {
  const patterns = ["BIGG", "SMALL"];
  return patterns[Math.floor(Math.random() * patterns.length)];
}

async function updatePanel() {
  try {
    const res = await fetch(`${API_URL}?ts=${Date.now()}`);
    const j = await res.json();
    const data = j?.data?.list || [];
    if (!data.length) return;

    const cur = data[0];
    const currentPeriod = cur.issue || cur.issueNumber;
    const nextPeriod = (BigInt(currentPeriod) + 1n).toString();

    if (lastPredictedPeriod !== nextPeriod) {
      console.log(`🎯 Detected New Period: ${nextPeriod}`);
      
      // ১. আগের রেজাল্ট অনুযায়ী স্টিকার পাঠানো
      if (predictionHistory.length > 0) {
        const actualNum = parseInt(String(cur.number || cur.result).slice(-1));
        const actualRes = actualNum >= 5 ? "BIGG" : "SMALL";
        if (predictionHistory[0].predicted === actualRes) {
          await sendToTelegram(WIN_STICKER, true);
        } else {
          await sendToTelegram(LOSS_STICKER, true);
        }
      }

      // ২. ১০ সেকেন্ড ওয়েট
      await new Promise(res => setTimeout(res, 10000)); 

      // ৩. প্রেডিকশন পাঠানো
      const p = getPatternPrediction();
      const timeNow = new Date().toLocaleTimeString("en-US", { 
          timeZone: "Asia/Dhaka", hour: '2-digit', minute: '2-digit', hour12: true 
      });
      
      const msg = `🎰 <b>WINGO 1M MARKET</b>\n` +
                  `📊 <b>PERIOD:</b> ${nextPeriod}\n` +
                  `⏰ <b>Time:</b> ${timeNow}\n` +
                  `🎯 <b>BUY:</b> ${p === "BIGG" ? "🔴 BIGG" : "🟢 SMALL"}\n\n` +
                  `⚡️<b>THIS SIGNAL PROVIDED BY TWS TEAM</b>⚡️\n\n` +
                  `📞 @OWNER_TWS`;
      
      await sendToTelegram(msg);
      console.log(`✅ Prediction Sent: ${p}`);

      predictionHistory.unshift({ period: nextPeriod, predicted: p });
      lastPredictedPeriod = nextPeriod;
    }
  } catch (err) { console.log("Syncing..."); }
}

// ================= RENDER SERVER (MUST) =================
http.createServer((req, res) => {
    res.writeHead(200);
    res.end('SAIF BOT ACTIVE');
}).listen(process.env.PORT || 10000);

// ================= START =================
console.log(`🚀 Bot Started for ${USER_NAME} (${USER_COUNTRY})`);
setInterval(updatePanel, REFRESH_TIME);
