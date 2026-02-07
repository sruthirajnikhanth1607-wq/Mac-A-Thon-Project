require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("."));

app.post("/api/chat", async (req, res) => {
    const userText = req.body.text;
    const userLocation = req.body.location || "Unknown";

    console.log(`📩 Received: ${userText}`);

    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ reply: "⚠️ Server Error: API Key missing." });
    }

    try {
        // FIX: Switched to 'gemini-pro' which is the most stable model
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        role: "user",
                        parts: [{ 
                            text: `You are CitySense, a safety assistant. Keep advice brief.\nLocation: ${userLocation}\nUser: ${userText}` 
                        }]
                    }]
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("❌ Google Error:", JSON.stringify(data, null, 2));
            return res.status(500).json({ reply: "⚠️ AI Service Error. Check terminal for details." });
        }

        const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ No response.";
        console.log("✅ Reply sent.");
        res.json({ reply: botReply });

    } catch (error) {
        console.error("❌ Server Crash:", error);
        res.status(500).json({ reply: "⚠️ Connection failed." });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}/chat.html`);
});