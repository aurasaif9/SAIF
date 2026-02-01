#!/usr/bin/env node
// SAIF 1M – REAL HISTORY BASED SIGNAL BOT

import readline from "readline";
import os from "os";
import express from "express";

// ================= SERVER (RENDER LIVE FIX) =================
const app = express();
const PORT = process.env.PORT || 10000;
app.get("/", (_, res) => res.send("TWS WINGO BOT LIVE"));
app.listen(PORT, () => console.log("🌐 SERVER RUNNING ON", PORT));

// ================= TELEGRAM CONFIG =================
const TELEGRAM_BOT_TOKEN = "8281243098:AAFf4wdCowXR6ent0peu7ngL_GYW7dXPqY8";
const TELEGRAM_CHAT_ID = "@TWS_Teams";

const WIN_STICKER = "CAACAgUAAxkBAAMJaVaqlqfj3ezjjCGTEsZrhwbxTyAAAqQaAAI4ZQlVFQAB7e-5iBcyOAQ";
const LOSS_STICKER = "CAACAgUAAxkBAAMKaVaqlwtXJIhkqunkRi-DkH0LP_cAAuAeAAJ1FQhVCo9WKmwYFIw4BA";

// ================= CONFIG =================
const API_URL = "https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json";
const REFRESH_TIME = 15000;

// ================= GLOBAL =================
let predictionHistory = [];
let lastPredictedPeriod = null;
let nextUpdateTime = Date.now() + REFRESH_TIME;

// ================= UTILS =================
const delay = ms => new Promise(r => setTimeout(r, ms));

// ================= TELEGRAM =================
async function sendToTelegram(message, isSticker = false) {
  const type = isSticker ? "sendSticker" : "sendMessage";
  const key = isSticker ? "sticker" : "text";

  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        [key]: message,
        parse_mode: isSticker ? undefined : "HTML"
      })
    });
    const j = await res.json();
    if (j.ok && !isSticker) console.log("✅ PREDICTION SENT");
  } catch {
    console.log("❌ TELEGRAM ERROR");
  }
}

// ================= FETCH HISTORY =================
async function fetchGameResult() {
  try {
    const r = await fetch(`${API_URL}?ts=${Date.now()}`);
    const j = await r.json();
    return j?.data?.list || [];
  } catch {
    return [];
  }
}

// ================= REAL PREDICTION LOGIC =================
function analyzePrediction(history) {
  // last 3 results
  const last3 = history.slice(0, 3).map(x =>
    parseInt(String(x.number || x.result).slice(-1)) >= 5 ? "BIGG" : "SMALL"
  );

  // pattern logic
  if (last3.every(x => x === "BIGG")) return "SMALL";
  if (last3.every(x => x === "SMALL")) return "BIGG";

  // trend follow
  return last3[0];
}

// ================= MAIN LOOP =================
async function updatePanel() {
  const data = await fetchGameResult();
  if (!data.length) return;

  const cur = data[0];
  const currentPeriod = cur.issue || cur.issueNumber;
  const nextPeriod = (BigInt(currentPeriod) + 1n).toString();

  if (lastPredictedPeriod === nextPeriod) return;

  // ===== CHECK LAST RESULT =====
  if (predictionHistory.length > 0) {
    const actualNum = parseInt(String(cur.number || cur.result).slice(-1));
    const actualRes = actualNum >= 5 ? "BIGG" : "SMALL";
    predictionHistory[0].actual = actualRes;

    if (predictionHistory[0].predicted === actualRes) {
      await sendToTelegram(WIN_STICKER, true);
    } else {
      await sendToTelegram(LOSS_STICKER, true);
    }
  }

  console.log("⏳ WAITING 10s...");
  await delay(10000);

  // ===== REAL PREDICTION =====
  const prediction = analyzePrediction(data);
  const timeNow = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });

  const msg =
    `🎰 <b>WINGO 1M MARKET</b>\n` +
    `📊 <b>PERIOD:</b> ${nextPeriod}\n` +
    `⏰ <b>Time:</b> ${timeNow}\n` +
    `🎯 <b>BUY:</b> ${prediction === "BIGG" ? "🔴 BIGG" : "🟢 SMALL"}\n\n` +
    `⚡️<b>THIS SIGNAL PROVIDED BY TWS TEAM</b>⚡️\n\n` +
    `📞 @OWNER_TWS`;

  await sendToTelegram(msg);

  predictionHistory.unshift({
    period: nextPeriod,
    predicted: prediction,
    actual: null
  });

  lastPredictedPeriod = nextPeriod;
  nextUpdateTime = Date.now() + REFRESH_TIME;
}

// ================= TIMER =================
setInterval(updatePanel, REFRESH_TIME);
setInterval(() => {
  const s = Math.max(0, Math.floor((nextUpdateTime - Date.now()) / 1000));
  process.stdout.write(`⏳ NEXT UPDATE IN : ${s}s\r`);
}, 1000);

console.log("🚀 TWS REAL SIGNAL BOT STARTED");
