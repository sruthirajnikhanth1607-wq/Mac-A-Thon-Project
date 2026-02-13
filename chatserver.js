require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);
app.use(cors());
app.use(express.json());
app.use(express.static("."));

// --- API KEY SANITIZER ---
// This removes spaces, quotes, and hidden newline characters
const getCleanKey = () => {
    const key = process.env.GEMINI_API_KEY || "";
    return key.replace(/['";\s]/g, '').trim(); 
};

console.log("🔑 API Key Status:", getCleanKey() ? "✅ Loaded" : "❌ Missing");
if (getCleanKey()) {
    console.log("🔑 Key Preview:", getCleanKey().substring(0, 10) + "...");
}

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { reply: "⚠️ Too many requests. Please wait 15 minutes." }
});

app.post("/api/chat", apiLimiter, async (req, res) => {
    const { text, location } = req.body;
    const userText = text || "";
    const userLocation = location || "Unknown";
    const apiKey = getCleanKey();

    if (!apiKey) {
        return res.status(500).json({ reply: "⚠️ API Key is missing in server .env" });
    }

    try {
        // FIXED: Changed from gemini-1.5-flash to gemini-pro
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [{ 
                        text: `Context: Safety Assistant. User Location: ${userLocation}. \n\nUser Message: ${userText}` 
                    }]
                }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("❌ Google API Error:", JSON.stringify(data, null, 2));
            return res.status(400).json({ 
                reply: "⚠️ Google rejected the API key. Ensure it is enabled in Google AI Studio." 
            });
        }

        const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ No response.";
        res.json({ reply: botReply });

    } catch (error) {
        console.error("❌ Fetch Error:", error);
        res.status(500).json({ reply: "⚠️ Server connection failed." });
    }
});

app.listen(PORT, () => {
    console.log(`✅ SafeSense Server: http://localhost:${PORT}`);
});