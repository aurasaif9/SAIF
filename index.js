#!/usr/bin/env node
// TWS WINGO 1M BOT – RENDER READY (FIXED NAME & COUNTRY)

import os from "os";

// ================= TELEGRAM CONFIG =================
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "PASTE_TOKEN_HERE";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "@TWS_Teams";

const WIN_STICKER =
  "CAACAgUAAxkBAAMJaVaqlqfj3ezjjCGTEsZrhwbxTyAAAqQaAAI4ZQlVFQAB7e-5iBcyOAQ";
const LOSS_STICKER =
  "CAACAgUAAxkBAAMKaVaqlwtXJIhkqunkRi-DkH0LP_cAAuAeAAJ1FQhVCo9WKmwYFIw4BA";

// ================= USER INFO (FIXED) =================
const USER_NAME = process.env.USER_NAME || "TWS BOT";
const USER_COUNTRY = process.env.USER_COUNTRY || "BANGLADESH 🇧🇩";

// ================= COLORS =================
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

    await fetch(
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
  } catch {}
}

// ================= UI =================
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

  console.log(`${C.white}-----------------------------------------------------------
 ${C.green}IP ADDRESS   : ${clr}${IP_ADDR}   ${C.green}LIVE TIME : ${clr}${time}
 ${C.green}NAME         : ${C.white}${USER_NAME}       ${C.green}COUNTRY : ${C.white}${USER_COUNTRY}
${C.white}-----------------------------------------------------------${C.reset}`);
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
    "SMALL"
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

async function updatePanel() {
  const data = await fetchGameResult();
  if (!data.length) return;

  const cur = data[0];
  const currentPeriod = cur.issue || cur.issueNumber;
  const nextPeriod = (BigInt(currentPeriod) + 1n).toString();

  drawHeader();

  if (lastPredictedPeriod !== nextPeriod) {
    // ===== RESULT CHECK =====
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

    console.log(`\n${C.magenta}⏳ WAITING 10S FOR TELEGRAM SIGNAL...${C.reset}`);
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

    predictionHistory.unshift({
      period: nextPeriod,
      predicted: p,
      actual: null
    });

    lastPredictedPeriod = nextPeriod;
  }

  predictionHistory.slice(0, 10).forEach((x, i) => {
    const res =
      x.actual === null
        ? `${C.yellow}WAIT`
        : x.predicted === x.actual
        ? `${C.green}WIN ✅`
        : `${C.red}LOSS ❌`;

    console.log(
      ` ${i + 1}. ${x.period.slice(-4)} → ${x.predicted} → ${res}${C.reset}`
    );
  });

  console.log(`${C.white}-----------------------------------------------------------${C.reset}`);
  nextUpdateTime = Date.now() + REFRESH_TIME;
}

function countdown() {
  const s = Math.max(0, Math.floor((nextUpdateTime - Date.now()) / 1000));
  process.stdout.write(`\r${C.yellow}⏳ UPDATE IN : ${s}s${C.reset}`);
}

// ================= START =================
console.log("🚀 TWS WINGO 1M BOT STARTED (RENDER MODE)");
updatePanel();
setInterval(updatePanel, REFRESH_TIME);
setInterval(countdown, 1000);
