const GEMINI_API_KEY = "AIzaSyA7ERDV19SY7_gz_QZsN88KfxQ7s_PXZwk";

async function sendMessage() {

  const input = document.getElementById("user-input");
  const userText = input.value.trim();

  if (!userText) return;

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
              role: "user",
              parts: [
                {
                  text: `You are CitySense, a city safety assistant. Give clear safety advice.\nUser: ${userText}`
                }
              ]
            }
          ]
        })
      }
    );

    // Debug status
    console.log("Status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", errorText);
      addMessage("⚠️ API request failed. Check console.", "bot");
      return;
    }

    const data = await response.json();
    console.log("Gemini data:", data);

    const botReply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text
      || "No response from AI.";

    addMessage(botReply, "bot");

  } catch (error) {
    console.error("Fetch error:", error);
    addMessage("⚠️ Connection error.", "bot");
  }
}

function addMessage(text, sender) {

  const chatBox = document.getElementById("chat-box");

  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.textContent = text;

  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}
