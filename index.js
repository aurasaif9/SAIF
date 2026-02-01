import express from "express";

// ================== TELEGRAM CONFIG ==================
const BOT_TOKEN = "8281243098:AAFf4wdCowXR6ent0peu7ngL_GYW7dXPqY8";
const CHAT_ID = "@TWS_Teams";

// ================== BOT CONFIG ==================
const UPDATE_TIME = 60; // seconds (1 minute)

// ================== HTTP SERVER (RENDER LIVE FIX) ==================
const app = express();
const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.send("✅ TWS WINGO BOT IS LIVE 🚀");
});

app.listen(PORT, () => {
  console.log("🌐 HTTP SERVER RUNNING ON PORT", PORT);
});

// ================== TELEGRAM SEND ==================
async function sendTelegram(msg) {
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: msg,
          parse_mode: "HTML"
        })
      }
    );

    const data = await res.json();
    if (data.ok) {
      console.log("✅ Prediction sent");
    } else {
      console.log("❌ Telegram API error:", data);
    }
  } catch (e) {
    console.log("❌ Telegram send failed:", e.message);
  }
}

// ================== DUMMY HISTORY ==================
function getHistory() {
  return Array.from({ length: 10 }, () =>
    Math.floor(Math.random() * 10)
  );
}

// ================== PREDICTION LOGIC ==================
function generatePrediction(history) {
  const last = history[history.length - 1];
  if (last >= 5) {
    return "🟢 SMALL";
  } else {
    return "🔴 BIG";
  }
}

// ================== TIMER FIX (NO 0 SEC BUG) ==================
let nextRun = Date.now() + UPDATE_TIME * 1000;

setInterval(async () => {
  const now = Date.now();
  const remaining = Math.ceil((nextRun - now) / 1000);

  if (remaining <= 0) {
    console.log("🔄 Generating prediction...");

    const history = getHistory();
    const prediction = generatePrediction(history);

    const message =
      `🎰 <b>TWS WINGO SIGNAL</b>\n\n` +
      `🎯 <b>BUY:</b> ${prediction}\n` +
      `⏰ <b>Valid for next round</b>\n\n` +
      `⚡️ <b>TWS TEAM</b>`;

    await sendTelegram(message);

    nextRun = Date.now() + UPDATE_TIME * 1000;
  } else {
    process.stdout.write(`⏳ Next Update IN: ${remaining} sec\r`);
  }
}, 1000);

console.log("🚀 TWS BOT STARTED SUCCESSFULLY");
