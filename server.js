require('dotenv').config(); // Load the secret key
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// Dynamic import for node-fetch to avoid version errors
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Middleware
app.use(express.json()); // Built-in replacement for body-parser
app.use(express.static(".")); // Serves your HTML files

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  const userText = req.body.text || "";
  const userLocation = req.body.location || "Unknown";

  console.log(`Received: ${userText} from ${userLocation}`); // Debug log

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
              text: `You are CitySense, an urban safety assistant. Provide practical safety advice. Assess risk when relevant.
              \nUser location: ${userLocation}
              \nScenario: ${userText}`
            }]
          }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error:", data);
      return res.status(500).json({ reply: "⚠️ AI Service Error." });
    }

    const botReply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't process that.";
    res.json({ reply: botReply });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ reply: "⚠️ Server connection failed." });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});