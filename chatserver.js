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
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

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