#!/usr/bin/env node
/**
 * Optimized for 24/7 Hosting (Render / GitHub Actions)
 * No interactive input - uses Environment Variables or Defaults
 */

import os from "os";

// ================= CONFIG & ENV =================
const TELEGRAM_BOT_TOKEN = process.env.BOT_TOKEN || "8281243098:AAFf4wdCowXR6ent0peu7ngL_GYW7dXPqY8"; 
const TELEGRAM_CHAT_ID = process.env.CHAT_ID || "@TWS_Teams"; 
const USER_NAME = process.env.USER_NAME || "SAIF_PRO";
const USER_COUNTRY = process.env.USER_COUNTRY || "BD";

const WIN_STICKER = "CAACAgUAAxkBAAMJaVaqlqfj3ezjjCGTEsZrhwbxTyAAAqQaAAI4ZQlVFQAB7e-5iBcyOAQ";
const LOSS_STICKER = "CAACAgUAAxkBAAMKaVaqlwtXJIhkqunkRi-DkH0LP_cAAuAeAAJ1FQhVCo9WKmwYFIw4BA";

const API_URL = "https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json";
const REFRESH_TIME = 20000; // Increased slightly to avoid API bans

// ================= COLORS & UI =================
const C = {
  reset: "\x1b[0m",
  green: "\x1b[1;32m",
  red: "\x1b[1;31m",
  cyan: "\x1b[1;36m",
  yellow: "\x1b[1;33m",
  white: "\x1b[1;37m"
};

// ================= GLOBALS =================
let predictionHistory = [];
let lastPredictedPeriod = null;
let isProcessing = false;

// ================= UTILS =================
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
