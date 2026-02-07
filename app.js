// ⚠️ Hackathon demo key
const GEMINI_API_KEY = "AIzaSyCt-RE4aDUKzyyVDUtuadeKIXKATvD9STw";

// Store location
let userLocation = "Unknown";

// Get GPS location
function getLocation() {
  if (!navigator.geolocation) {
    alert("Geolocation not supported.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      userLocation = pos.coords.latitude + ", " + pos.coords.longitude;
      alert("Location enabled 📍");
    },
    () => {
      alert("Location access denied.");
    }
  );
}

// Emergency keyword detector
function detectEmergency(text) {
  const emergencies = [
    "breaking in",
    "followed",
    "stalking",
    "harassing",
    "attack",
    "kidnap",
    "unsafe right now",
    "someone watching me"
  ];

  return emergencies.some((word) =>
    text.toLowerCase().includes(word)
  );
}

// Send message to Gemini
async function sendMessage() {
  const input = document.getElementById("user-input");
  const chatBox = document.getElementById("chat-box");

  const userText = input.value.trim();
  if (!userText) return;

  addMessage(userText, "user");
  input.value = "";

  // Immediate emergency warning
  if (detectEmergency(userText)) {
    addMessage(
      "🚨 If you are in immediate danger, contact emergency services now. Move to a populated or secure area while staying alert.",
      "bot"
    );
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
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

Your role:
• Provide practical safety advice
• Assess risk levels
• Suggest prevention strategies
• Encourage contacting authorities when needed

Rules:
• Do NOT replace emergency services
• Do NOT give illegal advice
• Focus on de-escalation and escape

When analyzing a scenario provide:

1. Risk Level (Low / Medium / High)
2. Why this risk level
3. Immediate actions
4. Prevention tips

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
      console.error("HTTP Error:", response.status);
      addMessage("⚠️ API request failed.", "bot");
      return;
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

    addMessage(botReply, "bot");

  } catch (error) {
    console.error("Fetch error:", error);
    addMessage("⚠️ Connection error. Try again.", "bot");
  }
}

// Add message to UI
function addMessage(text, sender) {
  const chatBox = document.getElementById("chat-box");

  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.textContent = text;

  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}
