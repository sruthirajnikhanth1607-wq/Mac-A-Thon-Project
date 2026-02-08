require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // Ensure node-fetch@2 is installed
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(".")); // Serve frontend files from root

// ==========================================
// 🤖 1. CHATBOT API (SafeSense AI)
// ==========================================
app.post("/api/chat", async (req, res) => {
    const userText = req.body.text;
    const userLocation = req.body.location || "Unknown";

    console.log(`📩 Chat Query: "${userText}"`);

    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ reply: "⚠️ Server Error: API Key missing." });
    }

    try {
        // ✅ Uses the NEW 'gemini-2.5-flash' model
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        role: "user",
                        parts: [{ 
                            text: `You are SafeSense, an intelligent safety assistant. 
                            The user is likely speaking to you, so keep your answer conversational and brief (2-3 sentences max).
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
            return res.status(500).json({ reply: "⚠️ AI Error. Please check server console." });
        }

        const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ No response generated.";
        console.log("✅ Reply sent.");
        res.json({ reply: botReply });

    } catch (error) {
        console.error("❌ Chat Server Error:", error);
        res.status(500).json({ reply: "⚠️ Connection failed." });
    }
});

// ==========================================
// 📍 2. MAP SERVER LOGIC (Trip Sessions)
// ==========================================
// This replaces your 'mapserver.js' functionality
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
    console.log(`✅ Master Server running at http://localhost:${PORT}`);
    console.log(`   - Chat: http://localhost:${PORT}/chat.html`);
    console.log(`   - Map:  http://localhost:${PORT}/map.html`);
});