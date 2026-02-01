#!/usr/bin/env node
// TWS WINGO 1M BOT + MINI SERVER (RENDER LIVE FIX)

import os from "os";
import http from "http";

// ================== MINI HTTP SERVER ==================
const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("✅ TWS WINGO 1M BOT IS LIVE\n");
}).listen(PORT, () => {
  console.log(`🌐 HTTP SERVER RUNNING ON PORT ${PORT}`);
});

// ================= TELEGRAM CONFIG =================
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const WIN_STICKER =
  "CAACAgUAAxkBAAMJaVaqlqfj3ezjjCGTEsZrhwbxTyAAAqQaAAI4ZQlVFQAB7e-5iBcyOAQ";
const LOSS_STICKER =
  "CAACAgUAAxkBAAMKaVaqlwtXJIhkqunkRi-DkH0LP_cAAuAeAAJ1FQhVCo9WKmwYFIw4BA";

// ================= USER INFO =================
const USER_NAME = process.env.USER_NAME || "TWS BOT";
const USER_COUNTRY = process.env.USER_COUNTRY || "BANGLADESH 🇧🇩";

// ================= CONFIG =================
const API_URL =
  "https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json";
const REFRESH_TIME = 15000;

// ================= GLOBAL =================
let predictionHistory = [];
let lastPredictedPeriod = null;
let nextUpdateTime = Date.now() + REFRESH_TIME;

// ================= UTILS =================
const delay = ms => new Promise(res => setTimeout(res, ms));

function getIP() {
  const nets = os.networkInterfaces();
  for (const n of Object.values(nets)) {
    for (const net of n) {
      if (net.family === "IPv4" && !net.internal) return net.address;
    }
  }
  return "127.0.0.1";
}
const IP_ADDR = getIP();

// ================= TELEGRAM =================
async function sendToTelegram(message, isSticker = false) {
  try {
    const type = isSticker ? "sendSticker" : "sendMessage";
    const bodyKey = isSticker ? "sticker" : "text";

    const res = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${type}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          [bodyKey]: message,
          parse_mode: isSticker ? undefined : "HTML"
        })
      }
    );

    if (res.ok) {
      console.log(isSticker ? "🟢 STICKER SENT" : "🟢 MESSAGE SENT");
    } else {
      console.log("🔴 TELEGRAM SEND FAILED");
    }
  } catch (e) {
    console.log("❌ TELEGRAM ERROR:", e.message);
  }
}

// ================= LOGIC =================
function getPatternPrediction() {
  const patterns = ["BIGG", "SMALL", "BIGG", "SMALL", "BIGG", "SMALL"];
  return patterns[Math.floor(Math.random() * patterns.length)];
}

async function fetchGameResult() {
  try {
    const res = await fetch(`${API_URL}?ts=${Date.now()}`);
    const j = await res.json();
    return j?.data?.list || [];
  } catch {
    return [];
  }
}

async function updatePanel() {
  const data = await fetchGameResult();
  if (!data.length) {
    console.log("⏳ WAITING FOR GAME DATA...");
    return;
  }

  const cur = data[0];
  const currentPeriod = cur.issue || cur.issueNumber;
  const nextPeriod = (BigInt(currentPeriod) + 1n).toString();

  if (lastPredictedPeriod !== nextPeriod) {
    // RESULT CHECK
    if (predictionHistory.length > 0) {
      const actualNum = parseInt(
        String(cur.number || cur.result).slice(-1)
      );
      const actualRes = actualNum >= 5 ? "BIGG" : "SMALL";

      await sendToTelegram(
        predictionHistory[0].predicted === actualRes
          ? WIN_STICKER
          : LOSS_STICKER,
        true
      );
    }

    console.log("⏳ WAITING 10 SECONDS...");
    await delay(10000);

    const p = getPatternPrediction();
    const timeNow = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });

    const msg =
      `🎰 <b>WINGO 1M MARKET</b>\n` +
      `📊 <b>PERIOD:</b> ${nextPeriod}\n` +
      `⏰ <b>Time:</b> ${timeNow}\n` +
      `🎯 <b>BUY:</b> ${p === "BIGG" ? "🔴 BIGG" : "🟢 SMALL"}\n\n` +
      `⚡️<b>THIS SIGNAL PROVIDED BY TWS TEAM</b>⚡️\n\n` +
      `📞 @OWNER_TWS`;

    await sendToTelegram(msg);
    console.log(`✅ PREDICTION SENT → ${nextPeriod} → ${p}`);

    predictionHistory.unshift({
      period: nextPeriod,
      predicted: p
    });

    lastPredictedPeriod = nextPeriod;
  }

  nextUpdateTime = Date.now() + REFRESH_TIME;
}

function countdown() {
  const s = Math.max(
    0,
    Math.floor((nextUpdateTime - Date.now()) / 1000)
  );
  process.stdout.write(`\r⏳ NEXT UPDATE IN : ${s}s`);
}

// ================= START =================
console.log("🚀 TWS WINGO 1M BOT + SERVER STARTED (RENDER LIVE)");
console.log(`📡 IP: ${IP_ADDR} | NAME: ${USER_NAME} | COUNTRY: ${USER_COUNTRY}`);

updatePanel();
setInterval(updatePanel, REFRESH_TIME);
setInterval(countdown, 1000);
