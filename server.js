const fetch = require("node-fetch");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

// 🔑 Gemini API key
const GEMINI_API_KEY = "AIzaSyBgm7h70I3iXm6plVzAljhEciuEUqAE4Fo";

// Middleware
app.use(bodyParser.json());
app.use(express.static(".")); // serves your HTML/CSS/JS

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  const userText = req.body.text || "";
  const userLocation = req.body.location || "Unknown";

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,  // Change model name here
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `
You are CitySense, an urban safety assistant.

Provide practical safety advice.
Assess risk when relevant.

User location: ${userLocation}
Scenario: ${userText}
`
                }
              ]
            }
          ]
        })
      }
    );

    if (!response.ok) {
      return res.json({
        reply: "⚠️ API request failed."
      });
    }

    const data = await response.json();

    let botReply = "Sorry, I couldn’t process that.";

    if (
      data.candidates &&
      data.candidates.length > 0 &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts.length > 0
    ) {
      botReply = data.candidates[0].content.parts[0].text;
    }

    res.json({ reply: botReply });

  } catch (error) {
    console.error(error);
    res.json({
      reply: "⚠️ Server error."
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
