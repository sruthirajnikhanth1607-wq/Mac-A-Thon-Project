// Send message to Gemini API
async function sendMessage() {
  const input = document.getElementById("user-input");
  const chatBox = document.getElementById("chat-box");

  const userText = input.value.trim();
  if (!userText) return;

  addMessage(userText, "user");
  input.value = "";

  // Send user message to backend
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: userText,
        location: "Unknown",  // You can modify this based on user's actual location
      })
    });

    const data = await response.json();

    addMessage(data.reply, "bot");
  } catch (error) {
    console.error("Error during API request:", error);
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

// Get location (optional)
function getLocation() {
  if (!navigator.geolocation) {
    alert("Geolocation not supported.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const userLocation = pos.coords.latitude + ", " + pos.coords.longitude;
      alert("Location enabled 📍");
    },
    () => {
      alert("Location access denied.");
    }
  );
}
