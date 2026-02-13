require('dotenv').config();
// Add debug logging to check if API key is loading
console.log("🔑 API Key loaded:", process.env.GEMINI_API_KEY ? "✅ Yes" : "❌ No");
console.log("🔑 API Key preview:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) + "..." : "MISSING");

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // node-fetch@2
const rateLimit = require('express-rate-limit'); // NEW: Security package
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. SECURITY: Trust Proxy (Required if you deploy to Render/Heroku/Vercel)
app.set('trust proxy', 1);

// 2. SECURITY: Rate Limiter (Prevents abuse)
// Limits each IP address to 100 requests every 15 minutes
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: { reply: "⚠️ You are sending too many messages. Please wait 15 minutes." },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Middleware
app.use(cors()); // Allow anyone to connect (for now)
app.use(express.json());
app.use(express.static(".")); // Serve your HTML/CSS/JS files

// ==========================================
// 🤖 1. CHATBOT API (Protected by Limiter)
// ==========================================
// Apply the limiter ONLY to the chat endpoint
app.post("/api/chat", apiLimiter, async (req, res) => {
    const userText = req.body.text;
    const userLocation = req.body.location || "Unknown";

    console.log(`📩 Chat Query: "${userText}"`);

    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ reply: "⚠️ Server Error: API Key missing." });
    }

    try {
        // FIXED: Changed from gemini-2.5-flash to gemini-1.5-flash
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        role: "user",
                        parts: [{ 
                            text: `You are SafeSense, an intelligent safety assistant. 
                            The user is asking a question via voice or text. 
                            Keep your response concise (under 2-3 sentences).
                            \nUser Location: ${userLocation}
                            \nUser Query: ${userText}` 
                        }]
                    }]
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("❌ Google API Error:", JSON.stringify(data, null, 2));
            return res.status(500).json({ reply: "⚠️ AI Error. Please check server logs." });
        }

        const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ No response generated.";
        console.log("✅ Reply sent.");
        res.json({ reply: botReply });

    } catch (error) {
        console.error("❌ Server Error:", error);
        res.status(500).json({ reply: "⚠️ Connection failed." });
    }
});

// ==========================================
// 📍 2. MAP SERVER LOGIC (Trip Sessions)
// ==========================================
const sessions = new Map();

// Create new session
app.post("/api/sessions", (req, res) => {
  const { sessionId, userId, destination, startTime, deadline, contacts, currentLocation } = req.body;
  sessions.set(sessionId, { 
      sessionId, userId, destination, startTime, deadline, 
      contacts, currentLocation, lastUpdate: Date.now(), status: 'active' 
  });
  console.log(`📍 New Trip Session: ${sessionId}`);
  res.json({ status: "ok", sessionId });
});

// Update location
app.put("/api/sessions/:sessionId/location", (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) return res.status(404).json({ error: "Session not found" });
  
  session.currentLocation = req.body;
  session.lastUpdate = Date.now();
  res.json({ status: "ok" });
});

// Get session info
app.get("/api/sessions/:sessionId", (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) return res.status(404).json({ error: "Session not found" });
  res.json(session);
});

// End session
app.put("/api/sessions/:sessionId/end", (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) return res.status(404).json({ error: "Session not found" });
  
  session.status = 'ended';
  session.endTime = Date.now();
  console.log(`🏁 Trip Ended: ${req.params.sessionId}`);
  res.json({ status: "ok" });
});

// ------------------------------------------
// 🚀 START MASTER SERVER
// ------------------------------------------
app.listen(PORT, () => {
    console.log(`✅ SafeSense Server running at http://localhost:${PORT}`);
});