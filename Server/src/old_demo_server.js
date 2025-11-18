import express from "express";
import { WebSocketServer } from "ws";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Create HTTP + WS server
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Simple in-memory stores
const users = new Map(); // username → { publicKey, ws }

// === ROUTES ===

// 1️⃣ Register user + public key
app.post("/register", (req, res) => {
  const { username, publicKey } = req.body;
  if (!username || !publicKey)
    return res.status(400).json({ error: "Missing fields" });

  users.set(username, { publicKey });
  console.log(`🔑 Registered: ${username}`);
  res.json({ success: true });
});

// 2️⃣ Fetch another user’s public key
app.get("/key/:username", (req, res) => {
  const user = users.get(req.params.username);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ publicKey: user.publicKey });
});

// === WEBSOCKET ===
wss.on("connection", (ws) => {
  ws.on("message", (raw) => {
    try {
      const data = JSON.parse(raw);

      if (data.type === "init") {
        // attach socket to username
        const user = users.get(data.username);
        if (user) user.ws = ws;
        console.log(`🟢 ${data.username} connected`);
      }

      if (data.type === "chat") {
        const { from, to, ciphertext } = data;
        const target = users.get(to);
        if (target?.ws?.readyState === 1) {
          target.ws.send(JSON.stringify({ from, ciphertext }));
          console.log(`📨 ${from} → ${to}`);
        }
      }
    } catch (err) {
      console.error("Invalid WS message:", err.message);
    }
  });

  ws.on("close", () => console.log("🔴 WebSocket closed"));
});

// === START SERVER ===
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
