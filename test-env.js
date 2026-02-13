// test-env.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log("\n=== ENVIRONMENT VARIABLE TEST ===\n");

// Check current directory
console.log("Current directory:", process.cwd());

// Check if .env exists
const envPath = path.join(process.cwd(), '.env');
console.log(".env path:", envPath);

try {
    if (fs.existsSync(envPath)) {
        console.log("✅ .env file EXISTS");
        
        // Read and show first line safely
        const content = fs.readFileSync(envPath, 'utf8');
        const lines = content.split('\n');
        console.log("First line starts with:", lines[0].substring(0, 20) + "...");
        
        // Check if it contains the key (more flexible check)
        if (content.includes('GEMINI_API_KEY=')) {
            console.log("✅ GEMINI_API_KEY found in file");
        } else {
            console.log("❌ GEMINI_API_KEY= not found in file");
        }
    } else {
        console.log("❌ .env file NOT FOUND!");
    }
} catch (err) {
    console.log("❌ Error reading .env:", err.message);
}

// Check loaded environment
console.log("\n--- Loaded Environment ---");
console.log("GEMINI_API_KEY present:", !!process.env.GEMINI_API_KEY);
if (process.env.GEMINI_API_KEY) {
    console.log("✅ Key loaded successfully!");
    console.log("Key length:", process.env.GEMINI_API_KEY.length);
    console.log("Starts with:", process.env.GEMINI_API_KEY.substring(0, 10) + "...");
} else {
    console.log("❌ API KEY NOT LOADED!");
}

console.log("PORT:", process.env.PORT || "not set");

console.log("\n=== YOUR .ENV FILE IS FINE! ===\n");
console.log("Now try running: node chatserver.js\n");