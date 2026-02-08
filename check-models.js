require('dotenv').config();
const fetch = require('node-fetch');

const API_KEY = process.env.GEMINI_API_KEY;

async function checkModels() {
  console.log("🔍 Connecting to Google to find your available models...");

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
    );

    const data = await response.json();

    if (data.models) {
      console.log("\n✅ SUCCESS! You have access to these models:");
      console.log("---------------------------------------------");
      data.models.forEach(model => {
        // We only care about models that can 'generateContent' (Chat)
        if (model.supportedGenerationMethods.includes("generateContent")) {
          console.log(`Model Name: ${model.name}`);
        }
      });
      console.log("---------------------------------------------");
      console.log("👉 Copy one of the names above (e.g., models/gemini-pro) into your server.js file.");
    } else {
      console.log("❌ Error fetching models:", JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.error("❌ Network Error:", error.message);
  }
}

checkModels();