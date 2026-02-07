require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allow frontend to connect
app.use(express.json()); // Parse JSON data
app.use(express.static(".")); // Serve your HTML/CSS files

// Chat Endpoint
app.post("/api/chat", async (req, res) => {
    const userText = req.body.text;
    const userLocation = req.body.location || "Unknown";

    console.log(`📩 Received from ${userLocation}: ${userText}`);

    // Check if key is loaded
    if (!process.env.GEMINI_API_KEY) {
        console.error("❌ API Key missing.");
        return res.status(500).json({ reply: "⚠️ Server Error: API Key missing." });
    }

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        role: "user",
                        parts: [{ 
                            text: `You are CitySense, a safety assistant. Keep advice brief and practical.\nLocation: ${userLocation}\nUser: ${userText}` 
                        }]
                    }]
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("❌ Google Error:", data);
            return res.status(500).json({ reply: "⚠️ AI Service Unavailable." });
        }

        const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ No response.";
        console.log("✅ Reply sent.");
        res.json({ reply: botReply });

    } catch (error) {
        console.error("❌ Server Crash:", error);
        res.status(500).json({ reply: "⚠️ Internal Server Error." });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}/chat.html`);
});