const GEMINI_API_KEY = "AIzaSyDID3Ca2V7G6pIlsMfUfJfjccTR5KBntvM";

async function sendMessage() {

  const input = document.getElementById("user-input");
  const chatBox = document.getElementById("chat-box");

  const userText = input.value.trim();
  if (!userText) return;

  // Show user message
  addMessage(userText, "user");
  input.value = "";

  try {

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
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
                  text:
                    `You are CitySense, a city safety assistant. 
Give clear, practical safety advice.

User: ${userText}`
                }
              ]
            }
          ]
        })
      }
    );

    // Check HTTP errors
    if (!response.ok) {
      console.error("HTTP Error:", response.status);
      addMessage("API request failed.", "bot");
      return;
    }

    const data = await response.json();
    console.log("Gemini response:", data);

    let botReply = "Sorry, I couldn’t process that.";

    if (
      data.candidates &&
      data.candidates.length > 0 &&
      data.candidates[0].content.parts.length > 0
    ) {
      botReply =
        data.candidates[0].content.parts[0].text;
    }

    addMessage(botReply, "bot");

  } catch (error) {
    console.error("Fetch error:", error);
    addMessage("Connection error. Try again.", "bot");
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
