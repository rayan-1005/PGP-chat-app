import { WebSocketServer } from "ws";
import { verifyJwt } from "./auth/jwt.js";
import User from "./models/user.models.js";
import Message from "./models/message.models.js";
import randomUUID from "crypto";

export function attachWebSocket(server) {
  const wss = new WebSocketServer({ server });
  const sockets = new Map(); // userId -> ws connection

  wss.on("connection", (ws, req) => {
    // Expect ?token=... in the URL
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get("token");

    try {
      const payload = verifyJwt(token);
      ws.userId = payload.sub;
      sockets.set(ws.userId, ws);
      ws.send(JSON.stringify({ type: "ws:ready" }));
      console.log(`🔗 User ${ws.userId} connected`);
    } catch (err) {
      console.warn("❌ Unauthorized WS connection:", err.message);
      ws.close(4401, "unauthorized");
      return;
    }

    // Handle incoming messages
    ws.on("message", async (raw) => {
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        return;
      }

      if (data.type !== "chat") return;
      if (!data.toUserId || !data.ciphertext) return;

      const payload = {
        type: "chat",
        id: crypto.randomUUID(),
        fromUserId: ws.userId,
        toUserId: data.toUserId,
        ciphertext: data.ciphertext,
        ts: new Date().toISOString(),
      };

      try {
        // ✅ Store encrypted message (E2EE — no decryption)
        await Message.create({
          fromUserId: ws.userId,
          toUserId: data.toUserId,
          ciphertext: data.ciphertext,
          ts: new Date(),
        });

        // ✅ Forward to recipient if online
        const target = sockets.get(data.toUserId);
        if (target && target.readyState === 1) {
          target.send(JSON.stringify(payload));
        }

        // ✅ Echo back to sender for local UI update
        if (ws.readyState === 1) {
          ws.send(JSON.stringify(payload));
        }
      } catch (err) {
        console.error("💥 WS message error:", err);
      }
    });

    ws.on("close", () => {
      sockets.delete(ws.userId);
      console.log(`🚪 User ${ws.userId} disconnected`);
    });
  });

  console.log("🛰️ WebSocket attached and running");
}
