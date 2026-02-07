// Import node-fetch
const fetch = require("node-fetch");

const GEMINI_API_KEY = "YOUR_KEY_HERE";  // Make sure your API key is inserted

async function listModels() {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models?key=${GEMINI_API_KEY}`
  );
  const data = await response.json();
  console.log("Available models:", data);
}

listModels();
