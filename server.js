const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Safety guidelines system prompt
const SYSTEM_PROMPT = `You are CitySense, a supportive and practical City Safety Assistant. Your role is to provide actionable safety advice, de-escalation tips, and preparedness planning.

IMPORTANT RULES:
1. Be empathetic, calm, and clear. Use a friendly but serious tone.
2. Prioritize immediate, actionable steps.
3. Tailor advice to urban environments.
4. If user describes emergency (attack, break-in, medical emergency, suicide), FIRST say: "🚨 If you are in immediate danger, please call emergency services (911) NOW."
5. Then provide supplemental guidance while they seek help.
6. Never suggest illegal activities or replace professional emergency services.
7. Keep responses concise but helpful (2-4 sentences usually).

You are expert in:
- Personal safety walking, transit, at night
- Situational awareness and risk assessment
- Planning safe routes and check-ins
- Explaining safety concepts simply

Format: Use brief paragraphs, occasional emojis (👮‍♂️ 🚶‍♀️ 📍), and bullet points for steps.`;

// Emergency keywords that trigger priority response
const EMERGENCY_KEYWORDS = [
  'emergency', '911', 'attack', 'hurt', 'bleeding', 'rape', 'assault',
  'suicide', 'kill', 'dying', 'break in', 'breaking in', 'weapon',
  'gun', 'knife', 'chasing', 'follow me', 'danger', 'help me'
];

// Mock location data (for demo)
const SAFE_ZONES = {
  "campus": { lat: 40.7128, lng: -74.0060, name: "University Campus", safety: "high" },
  "downtown": { lat: 40.7580, lng: -73.9855, name: "Downtown", safety: "medium" },
  "station": { lat: 40.7505, lng: -73.9934, name: "Central Station", safety: "high" }
};

// Chat history storage (in-memory for demo)
let chatHistories = {};

// Routes
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId = 'default', location } = req.body;
    
    // Initialize or get chat history
    if (!chatHistories[sessionId]) {
      chatHistories[sessionId] = [];
    }
    
    // Add user message to history
    chatHistories[sessionId].push({ role: 'user', content: message });
    
    // Check for emergency
    const isEmergency = EMERGENCY_KEYWORDS.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
    
    // Build context-aware prompt
    let context = SYSTEM_PROMPT;
    
    if (isEmergency) {
      context = "🚨 EMERGENCY SITUATION DETECTED. USER NEEDS IMMEDIATE HELP. " + context;
    }
    
    if (location) {
      // Find nearest safe zone
      let nearestZone = "Unknown area";
      let minDistance = Infinity;
      
      Object.values(SAFE_ZONES).forEach(zone => {
        const dist = Math.sqrt(
          Math.pow(zone.lat - location.lat, 2) + 
          Math.pow(zone.lng - location.lng, 2)
        );
        if (dist < minDistance) {
          minDistance = dist;
          nearestZone = zone.name;
        }
      });
      
      context += `\n\nUSER'S LOCATION CONTEXT: User is near ${nearestZone}. `;
      context += `Provide location-specific safety advice for urban areas. Mention well-lit streets, public spaces, and avoiding isolated areas.`;
    }
    
    // Add recent conversation history (last 3 exchanges)
    const recentHistory = chatHistories[sessionId].slice(-6);
    if (recentHistory.length > 0) {
      context += "\n\nRecent conversation:\n";
      recentHistory.forEach(msg => {
        context += `${msg.role}: ${msg.content}\n`;
      });
    }
    
    // Generate response
    const result = await model.generateContent(context + `\n\nUser: ${message}\nCitySense:`);
    const response = await result.response;
    const botMessage = response.text();
    
    // Add bot response to history
    chatHistories[sessionId].push({ role: 'assistant', content: botMessage });
    
    // Keep history manageable (last 10 messages)
    if (chatHistories[sessionId].length > 10) {
      chatHistories[sessionId] = chatHistories[sessionId].slice(-10);
    }
    
    res.json({
      success: true,
      message: botMessage,
      isEmergency: isEmergency
    });
    
  } catch (error) {
    console.error('Gemini API error:', error);
    res.status(500).json({
      success: false,
      message: "I'm having trouble connecting. Please try again or check your connection."
    });
  }
});

// Route to get nearby safe spots (mock data)
app.get('/api/nearby-safespots', (req, res) => {
  const { lat, lng } = req.query;
  
  // Mock data - in real app, use Google Places API
  const mockSafeSpots = [
    { name: "24-Hour Coffee Shop", type: "business", distance: "0.2 miles" },
    { name: "Police Station", type: "police", distance: "0.5 miles" },
    { name: "Hospital ER", type: "hospital", distance: "0.8 miles" },
    { name: "Well-lit Gas Station", type: "business", distance: "0.3 miles" },
    { name: "Public Library", type: "public", distance: "0.4 miles" }
  ];
  
  res.json({ safeSpots: mockSafeSpots });
});

// Start server
app.listen(port, () => {
  console.log(`CitySense server running at http://localhost:${port}`);
  console.log(`Get your Gemini API key at: https://makersuite.google.com/app/apikey`);
});