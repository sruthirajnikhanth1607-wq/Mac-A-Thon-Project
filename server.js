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

    console.log(`📩 Received from ${userLocation}: ${userText}`);

    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ reply: "⚠️ Server Error: API Key missing." });
    }

    try {
        // FIX: Changed model from 'gemini-1.5-flash' to 'gemini-1.5-flash-latest'
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        role: "user",
                        parts: [{ 
                            text: `You are CitySense, a safety assistant. Keep answers brief.\nLocation: ${userLocation}\nUser: ${userText}` 
                        }]
                    }]
                })
            }
        );

        const data = await response.json();

        // Check for errors again
        if (!response.ok) {
            console.error("❌ Google Error:", JSON.stringify(data, null, 2));
            
            // If Flash fails, suggest the user try 'gemini-pro'
            if (data.error && data.error.code === 404) {
                 return res.status(404).json({ reply: "⚠️ Model not found. Try changing 'gemini-1.5-flash-latest' to 'gemini-pro' in server.js" });
            }
            return res.status(500).json({ reply: "⚠️ AI Service Error." });
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