import fetch from "node-fetch";
import http from "http";

// ================= CONFIG =================
const USER_NAME = "SAIF";      
const USER_COUNTRY = "BD";     
const TELEGRAM_BOT_TOKEN = "8281243098:AAFf4wdCowXR6ent0peu7ngL_GYW7dXPqY8"; 
const TELEGRAM_CHAT_ID = "@TWS_Teams"; 

const WIN_STICKER = "CAACAgUAAxkBAAMJaVaqlqfj3ezjjCGTEsZrhwbxTyAAAqQaAAI4ZQlVFQAB7e-5iBcyOAQ";
const LOSS_STICKER = "CAACAgUAAxkBAAMKaVaqlwtXJIhkqunkRi-DkH0LP_cAAuAeAAJ1FQhVCo9WKmwYFIw4BA";
const API_URL = "https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json";

let lastPredictedPeriod = null;
let predictionHistory = [];

// ================= TELEGRAM SEND =================
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
  } catch (e) { console.log("TG Error"); }
}

// ================= MAIN LOGIC =================
async function updatePanel() {
  try {
    const res = await fetch(`${API_URL}?ts=${Date.now()}`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const j = await res.json();
    const data = j?.data?.list || [];
    if (!data.length) return;

    const cur = data[0];
    const currentPeriod = cur.issue || cur.issueNumber;
    const nextPeriod = (BigInt(currentPeriod) + 1n).toString();

    if (lastPredictedPeriod !== nextPeriod) {
      console.log(`🎯 New Period: ${nextPeriod}`);
      
      // রেজাল্ট অনুযায়ী স্টিকার
      if (predictionHistory.length > 0) {
        const actualNum = parseInt(String(cur.number || cur.result).slice(-1));
        const actualRes = actualNum >= 5 ? "BIGG" : "SMALL";
        await sendToTelegram(predictionHistory[0].predicted === actualRes ? WIN_STICKER : LOSS_STICKER, true);
      }

      await new Promise(r => setTimeout(r, 8000)); // ৮ সেকেন্ড গ্যাপ

      const p = Math.random() > 0.5 ? "BIGG" : "SMALL";
      const timeNow = new Date().toLocaleTimeString("en-US", { timeZone: "Asia/Dhaka", hour: '2-digit', minute: '2-digit', hour12: true });
      
      const msg = `🎰 <b>WINGO 1M</b>\n📊 <b>PERIOD:</b> <code>${nextPeriod}</code>\n⏰ <b>Time:</b> ${timeNow}\n🎯 <b>BUY:</b> ${p === "BIGG" ? "🔴 BIGG" : "🟢 SMALL"}\n\n⚡️<b>PROVIDED BY TWS TEAM</b>⚡️`;
      
      await sendToTelegram(msg);
      predictionHistory.unshift({ predicted: p });
      lastPredictedPeriod = nextPeriod;
    }
  } catch (err) { console.log("Syncing..."); }
}

// ================= RENDER HEALTH CHECK (Fixes "In Progress") =================
http.createServer((req, res) => {
    // এটি রেন্ডারের HEAD এবং GET রিকোয়েস্ট সফল করবে
    res.writeHead(200);
    res.end('ALIVE');
}).listen(process.env.PORT || 10000);

console.log(`🚀 Bot Active for ${USER_NAME}`);
setInterval(updatePanel, 15000);
