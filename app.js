const GEMINI_API_KEY = "YOUR_API_KEY_HERE";

async function testGemini() {

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
                text: "Say hello as a city safety assistant."
              }
            ]
          }
        ]
      })
    }
  );

  const data = await response.json();

  console.log(
    data.candidates[0].content.parts[0].text
  );
}

testGemini();
