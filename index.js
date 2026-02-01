#!/usr/bin/env node
// TWS WINGO 1M BOT – RENDER LIVE VERSION

import express from "express";
import os from "os";

// ================= HTTP SERVER (RENDER FIX) =================
const app = express();
const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.send("✅ TWS WINGO 1M BOT IS LIVE 🚀");
});

app.listen(PORT, () => {
  console.log("🌐 HTTP SERVER RUNNING ON PORT", PORT);
});

// ================= TELEGRAM CONFIG =================
const TELEGRAM_BOT_TOKEN = "8281243098:AAFf4wdCowXR6ent0peu7ngL_GYW7dXPqY8";
const TELEGRAM_CHAT_ID = "@TWS_Teams";

const WIN_STICKER =
  "CAACAgUAAxkBAAMJaVaqlqfj3ezjjCGTEsZrhwbxTyAAAqQaAAI4ZQlVFQAB7e-5iBcyOAQ";
const LOSS_STICKER =
  "CAACAgUAAxkBAAMKaVaqlwtXJIhkqunkRi-DkH0LP_cAAuAeAAJ1FQhVCo9WKmwYFIw4BA";

// ================= FIXED USER INFO =================
const USER_NAME = "TWS BOT";
const USER_COUNTRY = "BANGLADESH";

// ================= CONFIG =================
const API_URL =
  "https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json";
const REFRESH_TIME = 15000;

// ================= GLOBAL =================
let predictionHistory = [];
let lastPredictedPeriod = null;
let nextUpdateTime = Date.now() + REFRESH_TIME;

// ================= IP =================
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

// ================= UTILS =================
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// ================= TELEGRAM =================
async function sendToTelegram(message, isSticker = false) {
  const type = isSticker ? "sendSticker" : "sendMessage";
  const bodyKey = isSticker ? "sticker" : "text";

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${type}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          [bodyKey]: message,
          parse_mode: isSticker ? undefined : "HTML",
        }),
      }
    );

    if (!isSticker) {
      console.log("✅ PREDICTION SENT TO TELEGRAM");
    }
  } catch (e) {
    console.log("❌ TELEGRAM ERROR");
  }
}

// ================= LOGIC =================
function getPatternPrediction() {
  const patterns = [
    "BIGG",
    "SMALL",
    "BIGG",
    "BIGG",
    "SMALL",
    "SMALL",
    "BIGG",
    "SMALL",
  ];
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

// ================= MAIN LOOP =================
async function updatePanel() {
  const data = await fetchGameResult();
  if (!data.length) {
    console.log("⏳ WAITING FOR GAME DATA...");
    return;
  }

  const cur = data[0];
  const currentPeriod = cur.issue || cur.issueNumber;
  const nextPeriod = (BigInt(currentPeriod) + 1n).toString();

  if (lastPredictedPeriod === nextPeriod) return;

  // ===== RESULT CHECK =====
  if (predictionHistory.length > 0) {
    const actualNum = parseInt(String(cur.number || cur.result).slice(-1));
    const actualRes = actualNum >= 5 ? "BIGG" : "SMALL";

    const last = predictionHistory[0];
    last.actual = actualRes;

    if (last.predicted === actualRes) {
      await sendToTelegram(WIN_STICKER, true);
      console.log("🏆 RESULT : WIN");
    } else {
      await sendToTelegram(LOSS_STICKER, true);
      console.log("❌ RESULT : LOSS");
    }
  }

  // ===== DELAY =====
  console.log("⏳ WAITING 10s BEFORE NEXT SIGNAL...");
  await delay(10000);

  // ===== SEND NEW PREDICTION =====
  const p = getPatternPrediction();
  const timeNow = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const msg =
    `🎰 <b>WINGO 1M MARKET</b>\n` +
    `📊 <b>PERIOD:</b> ${nextPeriod}\n` +
    `⏰ <b>Time:</b> ${timeNow}\n` +
    `🎯 <b>BUY:</b> ${p === "BIGG" ? "🔴 BIGG" : "🟢 SMALL"}\n\n` +
    `⚡️<b>THIS SIGNAL PROVIDED BY TWS TEAM</b>⚡️\n\n` +
    `📞 @OWNER_TWS`;

  await sendToTelegram(msg);

  predictionHistory.unshift({
    period: nextPeriod,
    predicted: p,
    actual: null,
  });

  lastPredictedPeriod = nextPeriod;
  nextUpdateTime = Date.now() + REFRESH_TIME;

  console.log("📤 SIGNAL:", nextPeriod, p);
}

// ================= START =================
console.log("🚀 TWS WINGO 1M BOT STARTED (RENDER LIVE)");
console.log("IP:", IP_ADDR, "| NAME:", USER_NAME, "| COUNTRY:", USER_COUNTRY);

setInterval(updatePanel, REFRESH_TIME);
setInterval(() => {
  const s = Math.max(0, Math.floor((nextUpdateTime - Date.now()) / 1000));
  process.stdout.write(`⏳ NEXT UPDATE IN : ${s}s\r`);
}, 1000);
