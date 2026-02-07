const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
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
              text: `You are CitySense, a city safety assistant.
Give clear, practical safety advice.

User: ${userText}`
            }
          ]
        }
      ]
    })
  }
);

// 🔎 Log full error if request fails
if (!response.ok) {
  const errorData = await response.json();
  console.error("Full API Error:", errorData);
  addMessage("API request failed.", "bot");
  return;
}
