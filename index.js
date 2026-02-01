import fetch from "node-fetch";
import http from "http";

// ================= CONFIG =================
const BOT_TOKEN = "8281243098:AAFf4wdCowXR6ent0peu7ngL_GYW7dXPqY8"; 
const CHAT_ID = "@TWS_Teams"; 

// লটারি সার্ভারের ৩টি আলাদা লিঙ্ক (যেকোনো একটা কাজ করবেই)
const API_URLS = [
    "https://api.luckylotto.com/WinGo/WinGo_1M/GetHistoryIssuePage.json",
    "https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json",
    "https://api.wingo-lotto.com/WinGo/WinGo_1M/GetHistoryIssuePage.json"
];

let lastPeriod = null;

async function sendTG(text) {
    try {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: CHAT_ID, text: text, parse_mode: 'HTML' })
        });
    } catch (e) { console.log("TG Send Error"); }
}

async function runBot() {
    for (let url of API_URLS) {
        try {
            console.log(`📡 Trying API: ${url}`);
            const response = await fetch(`${url}?ts=${Date.now()}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                    'Accept': 'application/json'
                }
            });

            const json = await response.json();
            const list = json?.data?.list || [];
            
            if (list.length > 0) {
                const currentP = list[0].issue || list[0].issueNumber;
                const nextP = (BigInt(currentP) + 1n).toString();

                if (lastPeriod !== nextP) {
                    console.log(`🎯 Success! New Period: ${nextP}`);
                    const p = Math.random() > 0.5 ? "BIGG" : "SMALL";
                    const time = new Date().toLocaleTimeString("en-US", { timeZone: "Asia/Dhaka", hour: '2-digit', minute: '2-digit' });
                    
                    const msg = `🎰 <b>WINGO 1M</b>\n📊 <b>PERIOD:</b> <code>${nextP}</code>\n⏰ <b>Time:</b> ${time}\n🎯 <b>BUY:</b> ${p === "BIGG" ? "🔴 BIGG" : "🟢 SMALL"}\n\n⚡️<b>PROVIDED BY TWS TEAM</b>`;
                    await sendTG(msg);
                    lastPeriod = nextP;
                }
                return; // একটা কাজ করলে বাকিগুলো চেক করার দরকার নেই
            }
        } catch (err) {
            console.log(`❌ Failed on: ${url}`);
        }
    }
}

// Render Health Check
http.createServer((req, res) => {
    res.writeHead(200);
    res.end('ALIVE');
}).listen(process.env.PORT || 10000);

console.log("🚀 Multi-API Engine Started!");
setInterval(runBot, 15000);
