#!/usr/bin/env node
import http from "http";

const TELEGRAM_BOT_TOKEN = process.env.BOT_TOKEN || "8281243098:AAFf4wdCowXR6ent0peu7ngL_GYW7dXPqY8"; 
const TELEGRAM_CHAT_ID = process.env.CHAT_ID || "@TWS_Teams"; 
const API_URL = "https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json";

const WIN_STICKER = "CAACAgUAAxkBAAMJaVaqlqfj3ezjjCGTEsZrhwbxTyAAAqQaAAI4ZQlVFQAB7e-5iBcyOAQ";
const LOSS_STICKER = "CAACAgUAAxkBAAMKaVaqlwtXJIhkqunkRi-DkH0LP_cAAuAeAAJ1FQhVCo9WKmwYFIw4BA";

let predictionHistory = [];
let lastPredictedPeriod = null;
let isProcessing = false;

const sleep = ms => new Promise(res => setTimeout(res, ms));

async function sendToTelegram(message, isSticker = false) {
  try {
    const type = isSticker ? "sendSticker" : "sendMessage";
    const bodyKey = isSticker ? "sticker" : "text";
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, [bodyKey]: message, parse_mode: "HTML" })
    });
  } catch (e) { console.log(e.message); }
}

async function updatePanel() {
  if (isProcessing) return;
  isProcessing = true;
  try {
    const res = await fetch(`${API_URL}?ts=${Date.now()}`, {
      headers: { "user-agent": "Mozilla/5.0", "referer": "https://draw.ar-lottery01.com/" }
    });
    const j = await res.json();
    const data = j?.data?.list || [];
    if (!data.length) { isProcessing = false; return; }

    const cur = data[0];
    const currentPeriod = cur.issue || cur.issueNumber;
    const nextPeriod = (BigInt(currentPeriod) + 1n).toString();

    if (lastPredictedPeriod !== nextPeriod) {
      if (predictionHistory.length > 0 && predictionHistory[0].actual === null) {
        const actualRes = parseInt(String(cur.number || cur.result).slice(-1)) >= 5 ? "BIGG" : "SMALL";
        await sendToTelegram(predictionHistory[0].predicted === actualRes ? WIN_STICKER : LOSS_STICKER, true);
      }
      await sleep(10000); 
      const p = Math.random() > 0.5 ? "BIGG" : "SMALL";
      const msg = `🎰 <b>WINGO 1M</b>\n📊 <b>PERIOD:</b> ${nextPeriod}\n🎯 <b>BUY:</b> ${p === "BIGG" ? "🔴 BIGG" : "🟢 SMALL"}`;
      await sendToTelegram(msg);
      predictionHistory.unshift({ period: nextPeriod, predicted: p, actual: null });
      lastPredictedPeriod = nextPeriod;
      if (predictionHistory.length > 5) predictionHistory.pop();
    }
  } catch (err) { console.log(err.message); }
  isProcessing = false;
}

http.createServer((req, res) => { res.end('Running'); }).listen(process.env.PORT || 3000);
setInterval(updatePanel, 20000);
console.log("🚀 Started!");
