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
    "breaking in", "followed", "stalking", "harassing",
    "attack", "kidnap", "unsafe right now", "someone watching me"
  ];

  return emergencies.some((word) => text.toLowerCase().includes(word));
}

// Send message
async function sendMessage() {
  const input = document.getElementById("user-input");
  const userText = input.value.trim();
  if (!userText) return;

  addMessage(userText, "user");
  input.value = "";

  // Emergency instant warning
  if (detectEmergency(userText)) {
    addMessage(
      "🚨 If you are in immediate danger, contact emergency services now. Move to a populated or secure area.",
      "bot"
    );
  }

  try {
    const response = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: userText,
        location: userLocation
      })
    });

    const data = await response.json();
    addMessage(data.reply, "bot");

  } catch (error) {
    console.error("Connection Error:", error);
    addMessage("⚠️ Server not connected. Run 'node chatserver.js'", "bot");
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