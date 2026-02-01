#!/usr/bin/env node
// SAIF 1M – RENDER LIVE FIXED VERSION

import express from "express";
import os from "os";
import fetch from "node-fetch";

// ================= SERVER (RENDER LIVE) =================
const app = express();
const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.send("✅ TWS WINGO 1M BOT IS LIVE");
});

app.listen(PORT, () => {
  console.log("🌐 HTTP SERVER RUNNING ON PORT", PORT);
});

// ================= TELEGRAM CONFIG =================
const TELEGRAM_BOT_TOKEN = "8281243098:AAFf4wdCowXR6ent0peu7ngL_GYW7dXPqY8";
const TELEGRAM_CHAT_ID = "@TWS_Teams";

const WIN_STICKER = "CAACAgUAAxkBAAMJaVaqlqfj3ezjjCGTEsZrhwbxTyAAAqQaAAI4ZQlVFQAB7e-5iBcyOAQ";
const LOSS_STICKER = "CAACAgUAAxkBAAMKaVaqlwtXJIhkqunkRi-DkH0LP_cAAuAeAAJ1FQhVCo9WKmwYFIw4BA";

// ================= USER INFO =================
const USER_NAME = "TWS BOT";
const USER_COUNTRY = "BANGLADESH 🇧🇩";

// ================= CONFIG =================
const API_URL =
  "https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json";
const REFRESH_TIME = 15000;

// ================= GLOBAL =================
let predictionHistory = [];
let lastPredictedPeriod = null;
let nextUpdateTime = Date.now() + REFRESH_TIME;

// ================= UTILS =================
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function getIP() {
  const nets = os.networkInterfaces();
  for (const n of Object.values(nets)) {
    for (const net of n) {
      if (net.family === "IPv4" && !net.internal) return net.address;
    }
  }
  return "127.0.0.1";
}

// ================= TELEGRAM =================
async function sendToTelegram(message, isSticker = false) {
  const type = isSticker ? "sendSticker" : "sendMessage";
  const key = isSticker ? "sticker" : "text";

  const res = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${type}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        [key]: message,
        parse_mode: isSticker ? undefined : "HTML",
      }),
    }
  );

  if (res.ok && !isSticker) {
    console.log("📨 PREDICTION SENT TO TELEGRAM");
  }
}

// ================= LOGIC =================
function getPatternPrediction() {
  const arr = ["BIGG", "SMALL"];
  return arr[Math.floor(Math.random() * arr.length)];
}

async function fetchGameResult() {
  try {
    const res = await fetch(`${API_URL}?t=${Date.now()}`);
    const j = await res.json();
    return j?.data?.list || [];
  } catch {
    return [];
  }
}

async function updatePanel() {
  nextUpdateTime = Date.now() + REFRESH_TIME;

  const data = await fetchGameResult();
  if (!data.length) return;

  const cur = data[0];
  const currentPeriod = cur.issue || cur.issueNumber;
  const nextPeriod = (BigInt(currentPeriod) + 1n).toString();

  if (lastPredictedPeriod === nextPeriod) return;

  console.log("⏳ WAITING 10 SECONDS BEFORE SIGNAL...");
  await delay(10000);

  // === CHECK LAST RESULT ===
  if (predictionHistory.length > 0) {
    const num = parseInt(String(cur.number || cur.result).slice(-1));
    const actual = num >= 5 ? "BIGG" : "SMALL";
    const last = predictionHistory[0];
    last.actual = actual;

    if (last.predicted === actual) {
      await sendToTelegram(WIN_STICKER, true);
    } else {
      await sendToTelegram(LOSS_STICKER, true);
    }
  }

  // === SEND NEW PREDICTION ===
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

  console.log("✅ NEW SIGNAL:", nextPeriod, p);
}

// ================= COUNTDOWN =================
setInterval(() => {
  const s = Math.max(0, Math.floor((nextUpdateTime - Date.now()) / 1000));
  process.stdout.write(`\r⏳ NEXT UPDATE IN : ${s}s   `);
}, 1000);

// ================= START =================
console.log("🚀 TWS WINGO 1M BOT STARTED (RENDER LIVE)");
console.log("👤", USER_NAME, "| 🌍", USER_COUNTRY, "| IP:", getIP());

updatePanel();
setInterval(updatePanel, REFRESH_TIME);
