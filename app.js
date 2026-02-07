const GEMINI_API_KEY = "AIzaSyDID3Ca2V7G6pIlsMfUfJfjccTR5KBntvM";

async function sendMessage() {

  const input = document.getElementById("user-input");
  const chatBox = document.getElementById("chat-box");

  const userText = input.value;
  if (!userText) return;

  // Show user message
  addMessage(userText, "user");
  input.value = "";

  // Gemini request
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
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
                  `You are a city safety assistant. Give helpful safety advice.\nUser: ${userText}`
              }
            ]
          }
        ]
      })
    }
  );

  const data = await response.json();

  const botReply =
    data.candidates?.[0]?.content?.parts?.[0]?.text ||
    "Sorry, I couldn’t process that.";

  addMessage(botReply, "bot");
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
