import fetch from 'node-fetch';
import http from 'http';

// ================= CONFIG =================
const BOT_TOKEN = "8281243098:AAFf4wdCowXR6ent0peu7ngL_GYW7dXPqY8";
const CHAT_ID = "@TWS_Teams";
const API_URL = "https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json";

let lastPeriod = null;

// ================= TELEGRAM SEND =================
async function sendTG(text) {
    try {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: text,
                parse_mode: 'HTML'
            })
        });
    } catch (e) {
        console.log("TG Error: " + e.message);
    }
}

// ================= MAIN ENGINE =================
async function runBot() {
    try {
        const response = await fetch(`${API_URL}?ts=${Date.now()}`);
        const json = await response.json();
        
        const list = json?.data?.list || [];
        if (list.length === 0) return;

        const current = list[0];
        const currentPeriod = current.issue || current.issueNumber;
        const nextPeriod = (BigInt(currentPeriod) + 1n).toString();

        if (lastPeriod !== nextPeriod) {
            console.log(`🎯 New Period: ${nextPeriod}`);
            
            const prediction = Math.random() > 0.5 ? "BIGG" : "SMALL";
            const time = new Date().toLocaleTimeString('en-US', { 
                timeZone: 'Asia/Dhaka', 
                hour: '2-digit', 
                minute: '2-digit' 
            });

            const message = `🎰 <b>WINGO 1M</b>\n` +
                          `📊 <b>PERIOD:</b> <code>${nextPeriod}</code>\n` +
                          `⏰ <b>TIME:</b> ${time}\n` +
                          `🎯 <b>BUY:</b> ${prediction === "BIGG" ? "🔴 BIGG" : "🟢 SMALL"}\n\n` +
                          `⚡️<b>PROVIDED BY TWS TEAM</b>`;

            await sendTG(message);
            lastPeriod = nextPeriod;
        }
    } catch (err) {
        console.log("Syncing...");
    }
}

// ================= RENDER HEALTH CHECK =================
// এটি 501 এরর এবং পোর্ট সমস্যা সমাধান করবে
http.createServer((req, res) => {
    res.writeHead(200);
    res.end('BOT IS ACTIVE');
}).listen(process.env.PORT || 10000);

console.log("🚀 JS Bot Started... Tracking WinGo 1M!");
setInterval(runBot, 10000); // প্রতি ১০ সেকেন্ডে চেক করবে

