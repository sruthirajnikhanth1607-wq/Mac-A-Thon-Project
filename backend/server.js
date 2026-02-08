import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files

// In-memory storage for sessions (use database in production)
const sessions = new Map();

// Create a new trip session
app.post("/api/sessions", (req, res) => {
  const { sessionId, userId, destination, startTime, deadline, contacts, currentLocation } = req.body;
  
  sessions.set(sessionId, {
    sessionId,
    userId,
    destination,
    startTime,
    deadline,
    contacts,
    currentLocation,
    lastUpdate: Date.now(),
    status: 'active'
  });
  
  res.json({ status: "ok", sessionId });
});

// Update location for a session
app.put("/api/sessions/:sessionId/location", (req, res) => {
  const { sessionId } = req.params;
  const { lat, lon } = req.body;
  
  const session = sessions.get(sessionId);
  
  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }
  
  session.currentLocation = { lat, lon };
  session.lastUpdate = Date.now();
  
  sessions.set(sessionId, session);
  
  res.json({ status: "ok" });
});

// Get session data (for tracking page)
app.get("/api/sessions/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);
  
  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }
  
  res.json(session);
});

// End a session
app.put("/api/sessions/:sessionId/end", (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);
  
  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }
  
  session.status = 'ended';
  session.endTime = Date.now();
  
  sessions.set(sessionId, session);
  
  res.json({ status: "ok" });
});

// Clean up old sessions (optional - run periodically)
setInterval(() => {
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  
  for (const [sessionId, session] of sessions.entries()) {
    // Remove sessions older than 24 hours
    if (now - session.startTime > ONE_DAY) {
      sessions.delete(sessionId);
      console.log(`Cleaned up old session: ${sessionId}`);
    }
  }
}, 60 * 60 * 1000); // Run every hour

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Map page: http://localhost:${PORT}/map.html`);
  console.log(`Track page: http://localhost:${PORT}/track.html`);
});