require('dotenv').config();
const fetch = require('node-fetch');

const API_KEY = process.env.GEMINI_API_KEY;
const PORT = process.env.PORT || 3000;

console.log("🔍 Environment variables loaded:");
console.log(`   GEMINI_API_KEY: ${API_KEY ? "✅ Found (" + API_KEY.substring(0, 10) + "...)" : "❌ Missing"}`);
console.log(`   PORT: ${PORT ? "✅ " + PORT : "❌ Missing"}`);
console.log("-----------------------------------");

if (!API_KEY) {
    console.log("❌ No API key found in .env file");
    console.log("Please make sure GEMINI_API_KEY=your_key_here is in .env");
    process.exit(1);
}

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
        if (model.supportedGenerationMethods && 
            model.supportedGenerationMethods.includes("generateContent")) {
          console.log(`📌 Model Name: ${model.name}`);
          console.log(`   Display Name: ${model.displayName}`);
          console.log(`   Description: ${model.description}`);
          console.log("---------------------------------------------");
        }
      });
      console.log("\n👉 Copy one of the names above (e.g., models/gemini-pro) into your chatserver.js file.");
    } else {
      console.log("❌ Error fetching models:", JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.error("❌ Network Error:", error.message);
  }
}

checkModels();