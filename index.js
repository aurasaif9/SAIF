import http from "http";

// ================= TELEGRAM CONFIG =================
const TELEGRAM_BOT_TOKEN = "8281243098:AAFf4wdCowXR6ent0peu7ngL_GYW7dXPqY8"; 
const TELEGRAM_CHAT_ID = "@TWS_Teams"; 

const WIN_STICKER = "CAACAgUAAxkBAAMJaVaqlqfj3ezjjCGTEsZrhwbxTyAAAqQaAAI4ZQlVFQAB7e-5iBcyOAQ";
const LOSS_STICKER = "CAACAgUAAxkBAAMKaVaqlwtXJIhkqunkRi-DkH0LP_cAAuAeAAJ1FQhVCo9WKmwYFIw4BA";

const API_URL = "https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json";
const REFRESH_TIME = 15000; 

let predictionHistory = [];
let lastPredictedPeriod = null;

const delay = ms => new Promise(res => setTimeout(res, ms));

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
  } catch (e) {
    console.log("Telegram Error: ", e.message);
  }
}

function getPatternPrediction() {
  const patterns = ["BIGG", "SMALL", "BIGG", "BIGG", "SMALL", "SMALL", "BIGG", "SMALL", "BIGG", "SMALL"];
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
      // ১. আগে রেজাল্ট স্টিকার পাঠানো
      if (predictionHistory.length > 0) {
        const actualNum = parseInt(String(cur.number || cur.result).slice(-1));
        const actualRes = actualNum >= 5 ? "BIGG" : "SMALL";
        
        if (predictionHistory[0].predicted === actualRes) {
          await sendToTelegram(WIN_STICKER, true);
        } else {
          await sendToTelegram(LOSS_STICKER, true);
        }
      }

      // ২. ১০ সেকেন্ড অপেক্ষা
      console.log(`Waiting 10s for Period ${nextPeriod}...`);
      await delay(10000); 

      // ৩. নতুন প্রেডিকশন পাঠানো
      const p = getPatternPrediction();
      const timeNow = new Date().toLocaleTimeString("en-US", { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true, 
        timeZone: 'Asia/Dhaka' 
      });
      
      const msg = `🎰 <b>WINGO 1M MARKET</b>\n` +
                  `📊 <b>PERIOD:</b> ${nextPeriod}\n` +
                  `⏰ <b>Time:</b> ${timeNow}\n` +
                  `🎯 <b>BUY:</b> ${p === "BIGG" ? "🔴 BIGG" : "🟢 SMALL"}\n\n` +
                  `⚡️<b>THIS SIGNAL PROVIDED BY TWS TEAM</b>⚡️\n\n` +
                  `📞 @OWNER_TWS`;
      
      await sendToTelegram(msg);

      predictionHistory.unshift({ period: nextPeriod, predicted: p });
      if (predictionHistory.length > 10) predictionHistory.pop();
      
      lastPredictedPeriod = nextPeriod;
      console.log(`Successfully Sent: ${nextPeriod}`);
    }
  } catch (e) {
    console.log("System Fetch Error...");
  }
}

// Render-এর জন্য সার্ভার
http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('SAIF Bot is active!\n');
}).listen(process.env.PORT || 3000);

setInterval(updatePanel, REFRESH_TIME);
console.log("Bot running 24/7 Mode...");
function getPatternPrediction() {
  const patterns = ["BIGG", "SMALL", "BIGG", "BIGG", "SMALL", "SMALL", "BIGG", "SMALL", "BIGG", "SMALL"];
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
      // ১. আগে রেজাল্ট স্টিকার পাঠানো
      if (predictionHistory.length > 0) {
        const actualNum = parseInt(String(cur.number || cur.result).slice(-1));
        const actualRes = actualNum >= 5 ? "BIGG" : "SMALL";
        
        if (predictionHistory[0].predicted === actualRes) {
          await sendToTelegram(WIN_STICKER, true);
        } else {
          await sendToTelegram(LOSS_STICKER, true);
        }
      }

      // ২. ১০ সেকেন্ড অপেক্ষা
      console.log(`Waiting 10s for Period ${nextPeriod}...`);
      await delay(10000); 

      // ৩. নতুন প্রেডিকশন পাঠানো
      const p = getPatternPrediction();
      const timeNow = new Date().toLocaleTimeString("en-US", { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true, 
        timeZone: 'Asia/Dhaka' 
      });
      
      const msg = `🎰 <b>WINGO 1M MARKET</b>\n` +
                  `📊 <b>PERIOD:</b> ${nextPeriod}\n` +
                  `⏰ <b>Time:</b> ${timeNow}\n` +
                  `🎯 <b>BUY:</b> ${p === "BIGG" ? "🔴 BIGG" : "🟢 SMALL"}\n\n` +
                  `⚡️<b>THIS SIGNAL PROVIDED BY TWS TEAM</b>⚡️\n\n` +
                  `📞 @OWNER_TWS`;
      
      await sendToTelegram(msg);

      predictionHistory.unshift({ period: nextPeriod, predicted: p });
      if (predictionHistory.length > 10) predictionHistory.pop();
      
      lastPredictedPeriod = nextPeriod;
      console.log(`Successfully Sent: ${nextPeriod}`);
    }
  } catch (e) {
    console.log("System Fetch Error...");
  }
}

// Render-এর জন্য সার্ভার
http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('SAIF Bot is active!\n');
}).listen(process.env.PORT || 3000);

setInterval(updatePanel, REFRESH_TIME);
console.log("Bot running 24/7 Mode...");
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
      if (predictionHistory.length > 0) {
        const actualNum = parseInt(String(cur.number || cur.result).slice(-1));
        const actualRes = actualNum >= 5 ? "BIGG" : "SMALL";
        if (predictionHistory[0].predicted === actualRes) {
          await sendToTelegram(WIN_STICKER, true);
        } else {
          await sendToTelegram(LOSS_STICKER, true);
        }
      }

      await delay(10000); 

      const p = getPatternPrediction();
      const timeNow = new Date().toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Dhaka' });
      
      const msg = `🎰 <b>WINGO 1M MARKET</b>\n` +
                  `📊 <b>PERIOD:</b> ${nextPeriod}\n` +
                  `⏰ <b>Time:</b> ${timeNow}\n` +
                  `🎯 <b>BUY:</b> ${p === "BIGG" ? "🔴 BIGG" : "🟢 SMALL"}\n\n` +
                  `⚡️<b>THIS SIGNAL PROVIDED BY TWS TEAM</b>⚡️\n\n` +
                  `📞 @OWNER_TWS`;
      
      await sendToTelegram(msg);
      predictionHistory.unshift({ period: nextPeriod, predicted: p });
      lastPredictedPeriod = nextPeriod;
      console.log(`Sent: ${nextPeriod} - ${p}`);
    }
  } catch (e) { console.log("Error fetching data..."); }
}

// Render-এ চালানোর জন্য একটি ছোট সার্ভার (যাতে Sleep না হয়)
import http from "http";
http.createServer((req, res) => res.end("Bot is Running!")).listen(process.env.PORT || 3000);

setInterval(updatePanel, REFRESH_TIME);
console.log("Bot started 24/7...");
