import fetch from "node-fetch";
import http from "http";

const BOT_TOKEN = "8281243098:AAFf4wdCowXR6ent0peu7ngL_GYW7dXPqY8"; 
const CHAT_ID = "@TWS_Teams"; 
const API_URL = "https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json";

let lastPeriod = null;

async function runBot() {
    try {
        // রিকোয়েস্ট পাঠানোর সময় আসল ব্রাউজারের তথ্য ব্যবহার করা
        const res = await fetch(`${API_URL}?ts=${Date.now()}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Referer': 'https://ar-lottery01.com/',
                'Origin': 'https://ar-lottery01.com'
            }
        });

        // যদি রেসপন্স JSON না হয়, তবে এরর না দেখিয়ে চুপচাপ রিট্রাই করবে
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            console.log("☁️ API logic: HTML Error detected, retrying in 10s...");
            return;
        }

        const json = await res.json();
        const list = json?.data?.list || [];
        if (list.length === 0) return;

        const currentP = list[0].issue || list[0].issueNumber;
        const nextP = (BigInt(currentP) + 1n).toString();

        if (lastPeriod !== nextP) {
            console.log(`🎯 New Period Detected: ${nextP}`);
            
            // প্রেডিকশন লজিক
            const p = Math.random() > 0.5 ? "BIGG" : "SMALL";
            const time = new Date().toLocaleTimeString("en-US", { 
                timeZone: "Asia/Dhaka", hour: '2-digit', minute: '2-digit', hour12: true 
            });

            const msg = `🎰 <b>WINGO 1M</b>\n📊 <b>PERIOD:</b> <code>${nextP}</code>\n⏰ <b>Time:</b> ${time}\n🎯 <b>BUY:</b> ${p === "BIGG" ? "🔴 BIGG" : "🟢 SMALL"}\n\n⚡️<b>PROVIDED BY TWS TEAM</b>`;

            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: CHAT_ID, text: msg, parse_mode: 'HTML' })
            });

            lastPeriod = nextP;
            console.log("✅ Prediction Sent!");
        }
    } catch (err) {
        // এরর মেসেজ ক্লিন রাখা
        console.log("🔄 Syncing...");
    }
}

// Render Health Check
http.createServer((req, res) => {
    res.writeHead(200);
    res.end('ALIVE');
}).listen(process.env.PORT || 10000);

console.log("🚀 Anti-Logic Error Engine Started!");
setInterval(runBot, 15000); 
