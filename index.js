import http from "http";
import https from "https";

// ================= TELEGRAM CONFIG =================
const TELEGRAM_BOT_TOKEN = "8281243098:AAFf4wdCowXR6ent0peu7ngL_GYW7dXPqY8"; 
const TELEGRAM_CHAT_ID = "@TWS_Teams"; 
const WIN_STICKER = "CAACAgUAAxkBAAMJaVaqlqfj3ezjjCGTEsZrhwbxTyAAAqQaAAI4ZQlVFQAB7e-5iBcyOAQ";
const LOSS_STICKER = "CAACAgUAAxkBAAMKaVaqlwtXJIhkqunkRi-DkH0LP_cAAuAeAAJ1FQhVCo9WKmwYFIw4BA";
const API_URL = "https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json";

let predictionHistory = [];
let lastPredictedPeriod = null;

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function sendToTelegram(message, isSticker = false) {
    try {
        const type = isSticker ? "sendSticker" : "sendMessage";
        const bodyKey = isSticker ? "sticker" : "text";
        const payload = JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            [bodyKey]: message,
            parse_mode: isSticker ? null : "HTML"
        });

        const options = {
            hostname: 'api.telegram.org',
            path: `/bot${TELEGRAM_BOT_TOKEN}/${type}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        };

        const req = https.request(options);
        req.on('error', (e) => console.log("TG API error"));
        req.write(payload);
        req.end();
    } catch (err) {
        console.log("TG send failed");
    }
}

function getPatternPrediction() {
    const patterns = ["BIGG", "SMALL"];
    return patterns[Math.floor(Math.random() * patterns.length)];
}

async function updatePanel() {
    https.get(`${API_URL}?ts=${Date.now()}`, (res) => {
        let body = "";
        res.on("data", (chunk) => { body += chunk; });
        res.on("end", async () => {
            try {
                const j = JSON.parse(body);
                const data = j?.data?.list || [];
                if (!data.length) return;

                const cur = data[0];
                const currentPeriod = cur.issue || cur.issueNumber;
                const nextPeriod = (BigInt(currentPeriod) + 1n).toString();

                if (lastPredictedPeriod !== nextPeriod) {
                    // ১. আগের রেজাল্ট স্টিকার পাঠানো
                    if (predictionHistory.length > 0) {
                        const actualNum = parseInt(String(cur.number || cur.result).slice(-1));
                        const actualRes = actualNum >= 5 ? "BIGG" : "SMALL";
                        await sendToTelegram(predictionHistory[0].predicted === actualRes ? WIN_STICKER : LOSS_STICKER, true);
                    }

                    // ২. ১০ সেকেন্ড ওয়েট করা
                    await delay(10000); 

                    // ৩. নতুন সিগন্যাল পাঠানো
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
                    if (predictionHistory.length > 5) predictionHistory.pop();
                    lastPredictedPeriod = nextPeriod;
                    console.log("Success: Prediction sent for " + nextPeriod);
                }
            } catch (e) {
                console.log("Data parsing error");
            }
        });
    }).on("error", (e) => {
        console.log("API Fetch error");
    });
}

// Render-এর জন্য সার্ভার
http.createServer((req, res) => {
    res.writeHead(200);
    res.end("Bot Active");
}).listen(process.env.PORT || 3000);

// ১৫ সেকেন্ড পর পর চেক করবে
setInterval(updatePanel, 15000);
console.log("Bot started...");
        req.on('error', (e) => console.log("Telegram API error"));
        req.write(payload);
        req.end();
    } catch (err) {
        console.log("Telegram send failed");
    }
}

function getPatternPrediction() {
    const patterns = ["BIGG", "SMALL"];
    return patterns[Math.floor(Math.random() * patterns.length)];
}

async function updatePanel() {
    https.get(`${API_URL}?ts=${Date.now()}`, (res) => {
        let body = "";
        res.on("data", (chunk) => { body += chunk; });
        res.on("end", async () => {
            try {
                const j = JSON.parse(body);
                const data = j?.data?.list || [];
                if (!data.length) return;

                const cur = data[0];
                const currentPeriod = cur.issue || cur.issueNumber;
                const nextPeriod = (BigInt(currentPeriod) + 1n).toString();

                if (lastPredictedPeriod !== nextPeriod) {
                    if (predictionHistory.length > 0) {
                        const actualNum = parseInt(String(cur.number || cur.result).slice(-1));
                        const actualRes = actualNum >= 5 ? "BIGG" : "SMALL";
                        await sendToTelegram(predictionHistory[0].predicted === actualRes ? WIN_STICKER : LOSS_STICKER, true);
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
                    if (predictionHistory.length > 5) predictionHistory.pop();
                    lastPredictedPeriod = nextPeriod;
                    console.log("Success: Signal sent for period " + nextPeriod);
                }
            } catch (e) {
                console.log("Data error");
            }
        });
    }).on("error", (e) => {
        console.log("Fetch error");
    });
}

// Render-এর জন্য ছোট্ট সার্ভার
http.createServer((req, res) => {
    res.writeHead(200);
    res.end("SAIF Bot is active");
}).listen(process.env.PORT || 3000);

// প্রতি ১৫ সেকেন্ড পর পর ডাটা চেক করবে
setInterval(updatePanel, 15000);
console.log("Bot running successfully...");
        req.on('error', (e) => console.log("TG Request Error"));
        req.write(payload);
        req.end();
    } catch (err) {
        console.log("TG Send Error");
    }
}

function getPatternPrediction() {
    const patterns = ["BIGG", "SMALL"];
    return patterns[Math.floor(Math.random() * patterns.length)];
}

async function updatePanel() {
    https.get(`${API_URL}?ts=${Date.now()}`, (res) => {
        let body = "";
        res.on("data", (chunk) => body += chunk);
        res.on("end", async () => {
            try {
                const j = JSON.parse(body);
                const data = j?.data?.list || [];
                if (!data.length) return;

                const cur = data[0];
                const currentPeriod = cur.issue || cur.issueNumber;
                const nextPeriod = (BigInt(currentPeriod) + 1n).toString();

                if (lastPredictedPeriod !== nextPeriod) {
                    if (predictionHistory.length > 0) {
                        const actualNum = parseInt(String(cur.number || cur.result).slice(-1));
                        const actualRes = actualNum >= 5 ? "BIGG" : "SMALL";
                        await sendToTelegram(predictionHistory[0].predicted === actualRes ? WIN_STICKER : LOSS_STICKER, true);
                    }

                    await delay(10000); 

                    const p = getPatternPrediction();
                    const timeNow = new Date().toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Dhaka' });
                    const msg = `🎰 <b>WINGO 1M MARKET</b>\n📊 <b>PERIOD:</b> ${nextPeriod}\n⏰ <b>Time:</b> ${timeNow}\n🎯 <b>BUY:</b> ${p === "BIGG" ? "🔴 BIGG" : "🟢 SMALL"}\n\n⚡️<b>THIS SIGNAL PROVIDED BY TWS TEAM</b>⚡️\n\n📞 @OWNER_TWS`;
                    
                    await sendToTelegram(msg);
                    predictionHistory.unshift({ period: nextPeriod, predicted: p });
                    if (predictionHistory.length > 5) predictionHistory.pop();
                    lastPredictedPeriod = nextPeriod;
                    console.log("Success: Sent prediction for " + nextPeriod);
                }
            } catch (e) { console.log("Data Parse Error"); }
        });
    }).on("error", (e) => { console.log("API Fetch Error"); });
}

// Render-এর জন্য সার্ভার
http.createServer((req, res) => {
    res.writeHead(200);
    res.end("Bot Running Successfully");
}).listen(process.env.PORT || 3000);

setInterval(updatePanel, 15000);
console.log("Bot started...");
    req.end();
}

function getPatternPrediction() {
    const patterns = ["BIGG", "SMALL"];
    return patterns[Math.floor(Math.random() * patterns.length)];
}

async function updatePanel() {
    https.get(`${API_URL}?ts=${Date.now()}`, (res) => {
        let body = "";
        res.on("data", (chunk) => body += chunk);
        res.on("end", async () => {
            try {
                const j = JSON.parse(body);
                const data = j?.data?.list || [];
                if (!data.length) return;

                const cur = data[0];
                const currentPeriod = cur.issue || cur.issueNumber;
                const nextPeriod = (BigInt(currentPeriod) + 1n).toString();

                if (lastPredictedPeriod !== nextPeriod) {
                    if (predictionHistory.length > 0) {
                        const actualNum = parseInt(String(cur.number || cur.result).slice(-1));
                        const actualRes = actualNum >= 5 ? "BIGG" : "SMALL";
                        await sendToTelegram(predictionHistory[0].predicted === actualRes ? WIN_STICKER : LOSS_STICKER, true);
                    }

                    await delay(10000); 

                    const p = getPatternPrediction();
                    const timeNow = new Date().toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Dhaka' });
                    const msg = `🎰 <b>WINGO 1M MARKET</b>\n📊 <b>PERIOD:</b> ${nextPeriod}\n⏰ <b>Time:</b> ${timeNow}\n🎯 <b>BUY:</b> ${p === "BIGG" ? "🔴 BIGG" : "🟢 SMALL"}\n\n⚡️<b>THIS SIGNAL PROVIDED BY TWS TEAM</b>⚡️\n\n📞 @OWNER_TWS`;
                    
                    await sendToTelegram(msg);
                    predictionHistory.unshift({ period: nextPeriod, predicted: p });
                    if (predictionHistory.length > 5) predictionHistory.pop();
                    lastPredictedPeriod = nextPeriod;
                    console.log("Prediction Sent Successfully");
                }
            } catch (e) { console.log("JSON Error"); }
        });
    }).on("error", (e) => { console.log("Fetch Error: " + e.message); });
}

http.createServer((req, res) => res.end("Bot is Alive!")).listen(process.env.PORT || 3000);
setInterval(updatePanel, 15000);
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
      // ১. আগে আগের রেজাল্ট স্টিকার পাঠানো
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
      await delay(10000); 

      // ৩. নতুন সিগন্যাল পাঠানো
      const p = getPatternPrediction();
      const timeNow = new Date().toLocaleTimeString("en-US", { 
        hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Dhaka' 
      });
      
      const msg = `🎰 <b>WINGO 1M MARKET</b>\n` +
                  `📊 <b>PERIOD:</b> ${nextPeriod}\n` +
                  `⏰ <b>Time:</b> ${timeNow}\n` +
                  `🎯 <b>BUY:</b> ${p === "BIGG" ? "🔴 BIGG" : "🟢 SMALL"}\n\n` +
                  `⚡️<b>THIS SIGNAL PROVIDED BY TWS TEAM</b>⚡️\n\n` +
                  `📞 @OWNER_TWS`;
      
      await sendToTelegram(msg);

      predictionHistory.unshift({ period: nextPeriod, predicted: p });
      if (predictionHistory.length > 5) predictionHistory.pop();
      
      lastPredictedPeriod = nextPeriod;
      console.log("Prediction Sent: " + nextPeriod);
    }
  } catch (e) {
    console.log("Update Error");
  }
}

// Render-এর জন্য ছোট্ট সার্ভার
http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Bot is Alive!');
}).listen(process.env.PORT || 3000);

setInterval(updatePanel, REFRESH_TIME);
