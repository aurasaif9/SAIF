import fetch from "node-fetch";
import http from "http";

const BOT_TOKEN = "8281243098:AAFf4wdCowXR6ent0peu7ngL_GYW7dXPqY8"; 
const CHAT_ID = "@TWS_Teams"; 
const API_URL = "https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json";

let lastPeriod = null;

async function runBot() {
    try {
        // রিকোয়েস্ট পাঠানোর সময় ব্রাউজার হিসেবে পরিচয় দেওয়া (যাতে ব্লক না করে)
        const response = await fetch(`${API_URL}?ts=${Date.now()}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json'
            }
        });
        
        const json = await response.json();
        const list = json?.data?.list || [];
        
        if (list.length === 0) {
            console.log("☁️ API logic: No data yet, retrying...");
            return;
        }

        const currentP = list[0].issue || list[0].issueNumber;
        const nextP = (BigInt(currentP) + 1n).toString();

        if (lastPeriod !== nextP) {
            console.log(`🎯 New Period Found: ${nextP}`);
            
            const p = Math.random() > 0.5 ? "BIGG" : "SMALL";
            const time = new Date().toLocaleTimeString("en-US", { 
                timeZone: "Asia/Dhaka", hour: '2-digit', minute: '2-digit' 
            });

            const msg = `🎰 <b>WINGO 1M</b>\n📊 <b>PERIOD:</b> <code>${nextP}</code>\n⏰ <b>Time:</b> ${time}\n🎯 <b>BUY:</b> ${p === "BIGG" ? "🔴 BIGG" : "🟢 SMALL"}\n\n⚡️<b>PROVIDED BY TWS TEAM</b>`;

            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: CHAT_ID, text: msg, parse_mode: 'HTML' })
            });

            lastPeriod = nextP;
            console.log("✅ Message Sent to Telegram!");
        }
    } catch (err) {
        console.log("🔄 Syncing issue: " + err.message);
    }
}

// Render-কে শান্ত রাখার জন্য সার্ভার
http.createServer((req, res) => {
    res.writeHead(200);
    res.end('SAIF BOT IS ALIVE');
}).listen(process.env.PORT || 10000);

console.log("🚀 JS Engine Started! Tracking WinGo...");
setInterval(runBot, 10000); // ১০ সেকেন্ড পর পর চেক
