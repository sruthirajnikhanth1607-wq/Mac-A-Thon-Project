import express from "express";
import cors from "cors";

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json()); // so you can send JSON in requests

// Example endpoint for messages
let messages = []; // store messages in memory for now

app.post("/messages", (req, res) => {
  const { message } = req.body; // frontend sends { message: "Hello" }
  messages.push(message);
  res.json({ status: "ok", message: message });
});

app.get("/messages", (req, res) => {
  res.json({ messages });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
