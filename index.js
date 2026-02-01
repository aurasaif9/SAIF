#!/usr/bin/env node
import http from "http";

// ================= CONFIG & ENV =================
const TELEGRAM_BOT_TOKEN = process.env.BOT_TOKEN || "8281243098:AAFf4wdCowXR6ent0peu7ngL_GYW7dXPqY8"; 
const TELEGRAM_CHAT_ID = process.env.CHAT_ID || "@TWS_Teams"; 
const API_URL = "https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json";

const WIN_STICKER = "CAACAgUAAxkBAAMJaVaqlqfj3ezjjCGTEsZrhwbxTyAAAqQaAAI4ZQlVFQAB7e-5iBcyOAQ";
const LOSS_STICKER = "CAACAgUAAxkBAAMKaVaqlwtXJIhkqunkRi-DkH0LP_cAAuAeAAJ1FQhVCo9WKmwYFIw4BA";

const REFRESH_TIME = 20000; 

// ================= GLOBALS =================
let predictionHistory = [];
let lastPredictedPeriod = null;
let isProcessing = false;

// ================= UTILS =================
const sleep = ms => new Promise(res => setTimeout(res, ms));

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
    console.error("Telegram error:", e.message);
  }
}

function getPatternPrediction() {
  return Math.random() > 0.5 ? "BIGG" : "SMALL";
}

// ================= CORE LOGIC =================
async function updatePanel() {
  if (isProcessing) return;
  isProcessing = true;

  try {
    const res = await fetch(`${API_URL}?ts=${Date.now()}`, {
      headers: {
        "accept": "application/json, text/plain, */*",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "referer": "https://draw.ar-lottery01.com/"
      }
    });

    const rawText = await res.text();
    
    let j;
    try {
      j = JSON.parse(rawText);
    } catch (e) {
      console.log("⚠️ API Error: HTML instead of JSON. Server might be blocking.");
      isProcessing = false;
      return;
    }

    const data = j?.data?.list || [];
    if (!data.length) {
      isProcessing = false;
      return;
    }

    const cur = data[0];
    const currentPeriod = cur.issue || cur.issueNumber;
    const nextPeriod = (BigInt(currentPeriod) + 1n).toString();

    if (lastPredictedPeriod !== nextPeriod) {
      if (predictionHistory.length > 0 && predictionHistory[0].actual === null) {
        const actualNum = parseInt(String(cur.number || cur.result).slice(-1));
        const actualRes = actualNum >= 5 ? "BIGG" : "SMALL";
        predictionHistory[0].actual = actualRes;

        if (predictionHistory[0].predicted === actualRes) {
          await sendToTelegram(WIN_STICKER, true);
        } else {
          await sendToTelegram(LOSS_STICKER, true);
        }
      }

      console.log(`\n⏳ New Period: ${nextPeriod}. Waiting 10s...`);
      await sleep(10000); 

      const p = getPatternPrediction();
      const timeNow = new Date().toLocaleTimeString("en-US", { 
        hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Dhaka' 
      });
      
      const msg = `🎰 <b>WINGO 1M MARKET</b>\n` +
                  `📊 <b>PERIOD:</b> <code>${nextPeriod}</code>\n` +
                  `⏰ <b>Time:</b> ${timeNow}\n` +
                  `🎯 <b>BUY:</b> ${p === "BIGG" ? "🔴 BIGG" : "🟢 SMALL"}\n\n` +
                  `⚡️<b>THIS SIGNAL PROVIDED BY TWS TEAM</b>⚡️\n\n` +
                  `📞 @OWNER_TWS`;
      
      await sendToTelegram(msg);
      console.log(`✅ Signal Sent: ${p}`);

      predictionHistory.unshift({ period: nextPeriod, predicted: p, actual: null });
      lastPredictedPeriod = nextPeriod;
      if (predictionHistory.length > 5) predictionHistory.pop();
    }
  } catch (err) {
    console.error("Critical Loop Error:", err.message);
  } finally {
    isProcessing = false;
  }
}

// ================= RENDER PORT FIX =================
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Bot is Active and Running');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server live on port ${PORT}`);
});

// ================= START =================
console.log("🚀 Starting Bot... Relax!");
setInterval(updatePanel, REFRESH_TIME);

process.on('uncaughtException', (err) => console.log('Error:', err.message));
process.on('unhandledRejection', (err) => console.log('Rejection:', err.message));
      }
    });

    const rawText = await res.text();
    
    let j;
    try {
      j = JSON.parse(rawText);
    } catch (e) {
      console.log("⚠️ API Error: HTML instead of JSON.");
      isProcessing = false;
      return;
    }

    const data = j?.data?.list || [];
    if (!data.length) {
      isProcessing = false;
      return;
    }

    const cur = data[0];
    const currentPeriod = cur.issue || cur.issueNumber;
    const nextPeriod = (BigInt(currentPeriod) + 1n).toString();

    if (lastPredictedPeriod !== nextPeriod) {
      // 1. Result Check
      if (predictionHistory.length > 0 && predictionHistory[0].actual === null) {
        const actualNum = parseInt(String(cur.number || cur.result).slice(-1));
        const actualRes = actualNum >= 5 ? "BIGG" : "SMALL";
        predictionHistory[0].actual = actualRes;

        if (predictionHistory[0].predicted === actualRes) {
          await sendToTelegram(WIN_STICKER, true);
        } else {
          await sendToTelegram(LOSS_STICKER, true);
        }
      }

      // 2. Wait 10s
      console.log(`\n⏳ Next Period: ${nextPeriod}. Waiting 10s...`);
      await sleep(10000); 

      // 3. Send Prediction
      const p = getPatternPrediction();
      const timeNow = new Date().toLocaleTimeString("en-US", { 
        hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Dhaka' 
      });
      
      const msg = `🎰 <b>WINGO 1M MARKET</b>\n` +
                  `📊 <b>PERIOD:</b> <code>${nextPeriod}</code>\n` +
                  `⏰ <b>Time:</b> ${timeNow}\n` +
                  `🎯 <b>BUY:</b> ${p === "BIGG" ? "🔴 BIGG" : "🟢 SMALL"}\n\n` +
                  `⚡️<b>THIS SIGNAL PROVIDED BY TWS TEAM</b>⚡️\n\n` +
                  `📞 @OWNER_TWS`;
      
      await sendToTelegram(msg);
      console.log(`✅ Sent Prediction: ${p}`);

      predictionHistory.unshift({ period: nextPeriod, predicted: p, actual: null });
      lastPredictedPeriod = nextPeriod;
      if (predictionHistory.length > 5) predictionHistory.pop();
    }
  } catch (err) {
    console.error("Critical Loop Error:", err.message);
  } finally {
    isProcessing = false;
  }
}

// ================= RENDER PORT FIX =================
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Bot is Active');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server live on port ${PORT}`);
});

// ================= RUNNING =================
console.log("🚀 Starting Bot Version 2.0...");
setInterval(updatePanel, REFRESH_TIME);

process.on('uncaughtException', (err) => console.log('Error Handler:', err.message));
process.on('unhandledRejection', (err) => console.log('Rejection Handler:', err.message));
    console.error("Telegram error:", e.message);
  }
}

function getPatternPrediction() {
  return Math.random() > 0.5 ? "BIGG" : "SMALL";
}

// ================= CORE LOGIC =================
async function updatePanel() {
  if (isProcessing) return;
  isProcessing = true;

  try {
    const res = await fetch(`${API_URL}?ts=${Date.now()}`, {
      headers: {
        "accept": "application/json, text/plain, */*",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "referer": "https://draw.ar-lottery01.com/"
      }
    });

    const rawText = await res.text();
    
    let j;
    try {
      j = JSON.parse(rawText);
    } catch (e) {
      console.log("⚠️ API Error: HTML received instead of JSON.");
      isProcessing = false;
      return;
    }

    const data = j?.data?.list || [];
    if (!data.length) {
      isProcessing = false;
      return;
    }

    const cur = data[0];
    const currentPeriod = cur.issue || cur.issueNumber;
    const nextPeriod = (BigInt(currentPeriod) + 1n).toString();

    if (lastPredictedPeriod !== nextPeriod) {
      
      // 1. Result Check
      if (predictionHistory.length > 0 && predictionHistory[0].actual === null) {
        const actualNum = parseInt(String(cur.number || cur.result).slice(-1));
        const actualRes = actualNum >= 5 ? "BIGG" : "SMALL";
        predictionHistory[0].actual = actualRes;

        if (predictionHistory[0].predicted === actualRes) {
          await sendToTelegram(WIN_STICKER, true);
        } else {
          await sendToTelegram(LOSS_STICKER, true);
        }
      }

      // 2. Wait 10s
      console.log(`\n⏳ Next: ${nextPeriod}. Waiting...`);
      await sleep(10000); 

      // 3. Send Prediction
      const p = getPatternPrediction();
      const timeNow = new Date().toLocaleTimeString("en-US", { 
        hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Dhaka' 
      });
      
      const msg = `🎰 <b>WINGO 1M MARKET</b>\n` +
                  `📊 <b>PERIOD:</b> <code>${nextPeriod}</code>\n` +
                  `⏰ <b>Time:</b> ${timeNow}\n` +
                  `🎯 <b>BUY:</b> ${p === "BIGG" ? "🔴 BIGG" : "🟢 SMALL"}\n\n` +
                  `⚡️<b>THIS SIGNAL PROVIDED BY TWS TEAM</b>⚡️\n\n` +
                  `📞 @OWNER_TWS`;
      
      await sendToTelegram(msg);
      console.log(`✅ Sent Prediction: ${p}`);

      predictionHistory.unshift({ period: nextPeriod, predicted: p, actual: null });

      lastPredictedPeriod = nextPeriod;
      if (predictionHistory.length > 5) predictionHistory.pop();
    }
  } catch (err) {
    console.error("Critical Loop Error:", err.message);
  } finally {
    isProcessing = false;
  }
}

// ================= RENDER PORT FIX =================
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Active');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server live on port ${PORT}`);
});

// ================= RUN =================
console.log("🚀 Starting Bot...");
setInterval(updatePanel, REFRESH_TIME);

process.on('uncaughtException', (err) => console.log('Error:', err.message));
process.on('unhandledRejection', (err) => console.log('Rejection:', err.message));
  } catch (e) {
    console.error("Telegram error:", e.message);
  }
}

function getPatternPrediction() {
  const patterns = ["BIGG", "SMALL"];
  return patterns[Math.floor(Math.random() * patterns.length)];
}

// ================= CORE LOGIC =================
async function updatePanel() {
  if (isProcessing) return;
  isProcessing = true;

  try {
    const res = await fetch(`${API_URL}?ts=${Date.now()}`, {
      headers: {
        "accept": "application/json, text/plain, */*",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "referer": "https://draw.ar-lottery01.com/"
      }
    });

    const rawText = await res.text();
    
    // Check if response is valid JSON
    let j;
    try {
      j = JSON.parse(rawText);
    } catch (e) {
      console.log("⚠️ Received HTML instead of JSON. Server might be blocking or down.");
      isProcessing = false;
      return;
    }

    const data = j?.data?.list || [];
    if (!data.length) {
      isProcessing = false;
      return;
    }

    const cur = data[0];
    const currentPeriod = cur.issue || cur.issueNumber;
    const nextPeriod = (BigInt(currentPeriod) + 1n).toString();

    if (lastPredictedPeriod !== nextPeriod) {
      
      // 1. Result Check (Win/Loss)
      if (predictionHistory.length > 0 && predictionHistory[0].actual === null) {
        const actualNum = parseInt(String(cur.number || cur.result).slice(-1));
        const actualRes = actualNum >= 5 ? "BIGG" : "SMALL";
        predictionHistory[0].actual = actualRes;

        if (predictionHistory[0].predicted === actualRes) {
          await sendToTelegram(WIN_STICKER, true);
        } else {
          await sendToTelegram(LOSS_STICKER, true);
        }
      }

      // 2. Waiting Delay (10 seconds)
      console.log(`\n⏳ Next Period Found: ${nextPeriod}. Waiting 10s...`);
      await delay(10000); 

      // 3. Send Prediction
      const p = getPatternPrediction();
      const timeNow = new Date().toLocaleTimeString("en-US", { 
        hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Dhaka' 
      });
      
      const msg = `🎰 <b>WINGO 1M MARKET</b>\n` +
                  `📊 <b>PERIOD:</b> <code>${nextPeriod}</code>\n` +
                  `⏰ <b>Time:</b> ${timeNow}\n` +
                  `🎯 <b>BUY:</b> ${p === "BIGG" ? "🔴 BIGG" : "🟢 SMALL"}\n\n` +
                  `⚡️<b>THIS SIGNAL PROVIDED BY TWS TEAM</b>⚡️\n\n` +
                  `📞 @OWNER_TWS`;
      
      await sendToTelegram(msg);
      console.log(`✅ Signal Sent for ${nextPeriod}: ${p}`);

      predictionHistory.unshift({
        period: nextPeriod,
        predicted: p,
        actual: null
      });

      lastPredictedPeriod = nextPeriod;
      if (predictionHistory.length > 5) predictionHistory.pop();
    }
  } catch (err) {
    console.error("Critical Loop Error:", err.message);
  } finally {
    isProcessing = false;
  }
}

// ================= SERVER FOR RENDER =================
// Render-এ 'No open ports' এরর এড়াতে এই অংশটি প্রয়োজন
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot is running 24/7\n');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

// ================= START =================
console.log("🚀 Bot Started Successfully!");
setInterval(updatePanel, REFRESH_TIME);

// Global Error Handling
process.on('uncaughtException', (err) => console.log('Uncaught Exception:', err));
process.on('unhandledRejection', (err) => console.log('Unhandled Rejection:', err));
const delay = ms => new Promise(res => setTimeout(res, ms));

async function sendToTelegram(message, isSticker = false) {
  try {
    const type = isSticker ? "sendSticker" : "sendMessage";
    const bodyKey = isSticker ? "sticker" : "text";
    
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        [bodyKey]: message,
        parse_mode: isSticker ? null : "HTML"
      })
    });
    return await response.json();
  } catch (e) {
    console.error("Telegram Error:", e.message);
  }
}

function getPatternPrediction() {
  return Math.random() > 0.5 ? "BIGG" : "SMALL";
}

// ================= CORE LOGIC =================
async function updatePanel() {
  if (isProcessing) return;
  isProcessing = true;

  try {
    const res = await fetch(`${API_URL}?ts=${Date.now()}`);
    const j = await res.json();
    const data = j?.data?.list || [];

    if (!data.length) {
        isProcessing = false;
        return;
    }

    const cur = data[0];
    const currentPeriod = cur.issue || cur.issueNumber;
    const nextPeriod = (BigInt(currentPeriod) + 1n).toString();

    // Prevent duplicate processing of the same period
    if (lastPredictedPeriod !== nextPeriod) {
      
      // 1. Check Win/Loss of previous prediction
      if (predictionHistory.length > 0 && predictionHistory[0].actual === null) {
        const actualNum = parseInt(String(cur.number || cur.result).slice(-1));
        const actualRes = actualNum >= 5 ? "BIGG" : "SMALL";
        predictionHistory[0].actual = actualRes;

        if (predictionHistory[0].predicted === actualRes) {
          await sendToTelegram(WIN_STICKER, true);
        } else {
          await sendToTelegram(LOSS_STICKER, true);
        }
        console.log(`Period ${currentPeriod} Result: ${actualRes}`);
      }

      // 2. Cooldown for Telegram
      console.log(`Waiting 10s for Period: ${nextPeriod}`);
      await delay(10000); 

      // 3. New Prediction
      const p = getPatternPrediction();
      const timeNow = new Date().toLocaleTimeString("en-US", { 
          hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Dhaka' 
      });
      
      const msg = `🎰 <b>WINGO 1M MARKET</b>\n` +
                  `📊 <b>PERIOD:</b> <code>${nextPeriod}</code>\n` +
                  `⏰ <b>Time:</b> ${timeNow}\n` +
                  `🎯 <b>BUY:</b> ${p === "BIGG" ? "🔴 BIGG" : "🟢 SMALL"}\n\n` +
                  `⚡️<b>THIS SIGNAL PROVIDED BY TWS TEAM</b>⚡️\n\n` +
                  `📞 @OWNER_TWS`;
      
      await sendToTelegram(msg);

      predictionHistory.unshift({
        period: nextPeriod,
        predicted: p,
        actual: null
      });

      lastPredictedPeriod = nextPeriod;
      if (predictionHistory.length > 15) predictionHistory.pop();
    }
  } catch (err) {
    console.error("Critical Error in Loop:", err.message);
  } finally {
    isProcessing = false;
  }
}

// ================= INITIALIZATION =================
async function main() {
  console.log(`${C.cyan}Starting SAIF 1M Bot...${C.reset}`);
  console.log(`${C.white}User: ${USER_NAME} | Country: ${USER_COUNTRY}${C.reset}`);

  // Initial update
  await updatePanel();

  // Set Interval for continuous running
  setInterval(updatePanel, REFRESH_TIME);
}

// Global error handlers to keep the script alive
process.on('uncaughtException', (err) => console.error('Caught exception: ', err));
process.on('unhandledRejection', (reason, promise) => console.error('Unhandled Rejection: ', reason));

main();
