#!/usr/bin/env node
// TWS WINGO 1M BOT – FINAL FINAL FIX (NODE 22 BUILT-IN FETCH)

import os from "os";

/* ================= TELEGRAM CONFIG ================= */
const TELEGRAM_BOT_TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.CHAT_ID;

/* ================= STICKERS ================= */
const WIN_STICKER =
  "CAACAgUAAxkBAAMJaVaqlqfj3ezjjCGTEsZrhwbxTyAAAqQaAAI4ZQlVFQAB7e-5iBcyOAQ";
const LOSS_STICKER =
  "CAACAgUAAxkBAAMKaVaqlwtXJIhkqunkRi-DkH0LP_cAAuAeAAJ1FQhVCo9WKmwYFIw4BA";

/* ================= CONFIG ================= */
const API_URL =
  "https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json";
const REFRESH_TIME = 15000;

/* ================= GLOBAL ================= */
let predictionHistory = [];
let lastPredictedPeriod = null;
let nextUpdateTime = Date.now() + REFRESH_TIME;

/* ================= UTILS ================= */
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

/* ================= TELEGRAM ================= */
async function sendToTelegram(message, sticker = false) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${
    sticker ? "sendSticker" : "sendMessage"
  }`;

  const body = sticker
    ? { chat_id: TELEGRAM_CHAT_ID, sticker: message }
    : {
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "HTML"
      };

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
  } catch (e) {
    console.log("Telegram error:", e.message);
  }
}

/* ================= LOGIC ================= */
function getPrediction() {
  return Math.random() > 0.5 ? "BIGG" : "SMALL";
}

async function fetchGameResult() {
  try {
    const res = await fetch(`${API_URL}?t=${Date.now()}`, {
      headers: { Accept: "application/json" }
    });

    const text = await res.text();
    if (text.startsWith("<")) return [];

    const json = JSON.parse(text);
    return json?.data?.list || [];
  } catch {
    return [];
  }
}

async function update() {
  const data = await fetchGameResult();
  if (!data.length) return;

  const cur = data[0];
  const nextPeriod = (BigInt(cur.issue) + 1n).toString();

  if (lastPredictedPeriod !== nextPeriod) {
    if (predictionHistory.length) {
      const last = predictionHistory[0];
      const actual =
        parseInt(String(cur.number).slice(-1)) >= 5 ? "BIGG" : "SMALL";

      await sendToTelegram(
        last.predicted === actual ? WIN_STICKER : LOSS_STICKER,
        true
      );
    }

    const p = getPrediction();
    await sendToTelegram(
      `🎰 <b>WINGO 1M</b>\n📊 PERIOD: ${nextPeriod}\n🎯 BUY: ${
        p === "BIGG" ? "🔴 BIGG" : "🟢 SMALL"
      }`
    );

    predictionHistory.unshift({ period: nextPeriod, predicted: p });
    lastPredictedPeriod = nextPeriod;
  }

  nextUpdateTime = Date.now() + REFRESH_TIME;
}

/* ================= START ================= */
console.log("🚀 BOT STARTED");
setInterval(update, REFRESH_TIME);
