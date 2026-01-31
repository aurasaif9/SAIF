#!/usr/bin/env node
// TWS WINGO 1M BOT – RENDER 24/7 SAFE VERSION

import os from "os";
import fetch from "node-fetch";

/* ================= TELEGRAM CONFIG ================= */
const TELEGRAM_BOT_TOKEN = process.env.BOT_TOKEN; // Render Env Variable
const TELEGRAM_CHAT_ID = "@TWS_Teams";

const WIN_STICKER =
  "CAACAgUAAxkBAAMJaVaqlqfj3ezjjCGTEsZrhwbxTyAAAqQaAAI4ZQlVFQAB7e-5iBcyOAQ";
const LOSS_STICKER =
  "CAACAgUAAxkBAAMKaVaqlwtXJIhkqunkRi-DkH0LP_cAAuAeAAJ1FQhVCo9WKmwYFIw4BA";

/* ================= USER INFO ================= */
const USER_NAME = "SAIF";
const USER_COUNTRY = "BD";

/* ================= COLORS ================= */
const C = {
  reset: "\x1b[0m",
  white: "\x1b[1;37m",
  green: "\x1b[1;32m",
  red: "\x1b[1;31m",
  cyan: "\x1b[1;36m",
  yellow: "\x1b[1;33m",
  magenta: "\x1b[1;35m",
  bold: "\x1b[1m"
};

const RANDOM_COLORS = [
  "\x1b[1;36m",
  "\x1b[1;31m",
  "\x1b[1;32m",
  "\x1b[1;33m",
  "\x1b[1;35m"
];
const clr = RANDOM_COLORS[Math.floor(Math.random() * RANDOM_COLORS.length)];

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
const IP_ADDR = getIP();

/* ================= TELEGRAM ================= */
async function sendToTelegram(message, isSticker = false) {
  try {
    const method = isSticker ? "sendSticker" : "sendMessage";
    const payload = isSticker
      ? { chat_id: TELEGRAM_CHAT_ID, sticker: message }
      : {
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: "HTML"
        };

    await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${method}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );
  } catch (err) {
    console.log("Telegram error:", err.message);
  }
}

/* ================= UI ================= */
function drawHeader() {
  console.clear();
  const time = new Date().toLocaleTimeString("en-US");

  console.log(`${clr}
███████╗ █████╗ ██╗███████╗
██╔════╝██╔══██╗██║██╔════╝
███████╗███████║██║█████╗  
╚════██║██╔══██║██║██╔══╝  
███████║██║  ██║██║██║     
╚══════╝╚═╝  ╚═╝╚═╝╚═╝   1M${C.reset}`);

  console.log(`${C.white}-------------------------------------------
${C.green}IP      : ${clr}${IP_ADDR}
${C.green}TIME    : ${clr}${time}
${C.green}NAME    : ${C.white}${USER_NAME}
${C.green}COUNTRY : ${C.white}${USER_COUNTRY}
${C.white}-------------------------------------------${C.reset}`);
}

/* ================= LOGIC ================= */
function getPatternPrediction() {
  const patterns = [
    "BIGG",
    "SMALL",
    "BIGG",
    "BIGG",
    "SMALL",
    "SMALL",
    "BIGG",
    "SMALL"
  ];
  return patterns[Math.floor(Math.random() * patterns.length)];
}

/* ✅ FIXED TRY–CATCH (NO SYNTAX ERROR) */
async function fetchGameResult() {
  try {
    const res = await fetch(`${API_URL}?t=${Date.now()}`);
    const j = await res.json();
    return j?.data?.list || [];
  } catch (err) {
    console.log("Fetch error:", err.message);
    return [];
  }
}

async function updatePanel() {
  const data = await fetchGameResult();
  if (!data.length) return;

  const cur = data[0];
  const currentPeriod = cur.issue || cur.issueNumber;
  const nextPeriod = (BigInt(currentPeriod) + 1n).toString();

  drawHeader();

  if (lastPredictedPeriod !== nextPeriod) {
    if (predictionHistory.length > 0) {
      const actualNum = parseInt(
        String(cur.number || cur.result).slice(-1)
      );
      const actualRes = actualNum >= 5 ? "BIGG" : "SMALL";
      predictionHistory[0].actual = actualRes;

      await sendToTelegram(
        predictionHistory[0].predicted === actualRes
          ? WIN_STICKER
          : LOSS_STICKER,
        true
      );
    }

    console.log(`${C.magenta}⏳ WAITING 10s...${C.reset}`);
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
      `⏰ <b>TIME:</b> ${timeNow}\n` +
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
  }

  predictionHistory.slice(0, 10).forEach((x, i) => {
    const status =
      x.actual === null
        ? `${C.yellow}WAIT`
        : x.actual === x.predicted
        ? `${C.green}WIN`
        : `${C.red}LOSS`;

    console.log(
      `${i + 1}. ${x.period.slice(-4)} → ${x.predicted} → ${status}${C.reset}`
    );
  });

  nextUpdateTime = Date.now() + REFRESH_TIME;
}

function countdown() {
  const diff = Math.max(0, nextUpdateTime - Date.now());
  process.stdout.write(
    `\r${C.yellow}${C.bold}⏳ NEXT UPDATE ${Math.floor(
      diff / 1000
    )}s${C.reset}`
  );
}

/* ================= START ================= */
(async function start() {
  console.log(`${C.green}🚀 BOT STARTED${C.reset}`);
  await updatePanel();
  setInterval(updatePanel, REFRESH_TIME);
  setInterval(countdown, 1000);
})();
