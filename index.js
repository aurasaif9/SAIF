import fetch from "node-fetch";
import http from "http";

// ================= CONFIG =================
const BOT_TOKEN = "8281243098:AAFf4wdCowXR6ent0peu7ngL_GYW7dXPqY8"; 
const CHAT_ID = "@TWS_Teams"; 
const API_URL = "https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json";

let lastPeriod = null;

// ================= TG SEND =================
async function sendTG(text) {
    try {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: CHAT_ID, text: text, parse_mode: 'HTML' })
        });
    } catch (e) { console.log("TG Error"); }
}

// ================= MAIN ENGINE =================
async function runBot() {
    try {
        // Anti-Block Headers: ব্রাউজার হিসেবে পরিচয় দেওয়া
        const response = await fetch(`${API_URL}?ts=${Date.now()}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Origin': 'https://ar-lottery01.com',
                'Referer': 'https://ar-lottery01.com/'
            }
        });

        // যদি রেসপন্স JSON না হয় (HTML আসে), তবে স্কিপ করবে
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            console.log("☁️ API logic: Server returned HTML/Error, retrying...");
            return;
        }

        const json = await response.json();
        const list = json?.data?.list || [];
        
        if (list.length === 0) return;

        const currentP = list[0].issue || list[0].issueNumber;
        const nextP = (BigInt(currentP) + 1n).toString();

        if (lastPeriod !== nextP) {
            console.log(`🎯 New Period: ${nextP}`);
            
            const p = Math.random() > 0.5 ? "BIGG" : "SMALL";
            const time = new Date().toLocaleTimeString("en-US", { 
                timeZone: "Asia/Dhaka", hour: '2-digit', minute: '2-digit' 
            });

            const msg = `🎰 <b>WINGO 1M</b>\n📊 <b>PERIOD:</b> <code>${nextP}</code>\n⏰ <b>Time:</b> ${time}\n🎯 <b>BUY:</b> ${p === "BIGG" ? "🔴 BIGG" : "🟢 SMALL"}\n\n⚡️<b>PROVIDED BY TWS TEAM</b>`;

            await sendTG(msg);
            lastPeriod = nextP;
            console.log("✅ Prediction Sent!");
        }
    } catch (err) {
        // HTML এরর আসলে আর বড় এরর মেসেজ দেখাবে না
        console.log("🔄 Syncing...");
    }
}

// Render Health Check
http.createServer((req, res) => {
    res.writeHead(200);
    res.end('ALIVE');
}).listen(process.env.PORT || 10000);

console.log("🚀 Anti-Block Engine Started!");
setInterval(runBot, 10000);
