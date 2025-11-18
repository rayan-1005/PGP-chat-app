import dotenv from "dotenv";
dotenv.config();
import express from "express";
import http from "http";
import cors from "cors";

import rateLimit from "express-rate-limit";
import passport from "./auth/passport.js";
import { connectDB } from "./config.js";
import localAuth from "./routes/auth.local.js";
import googleAuth from "./routes/auth.google.js";
import keyRoutes from "./routes/key.js";
import { attachWebSocket } from "./ws.js";
import messagesRoutes from "./routes/messages.js";

await connectDB();

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"], // ✅ Specify allowed methods
    allowedHeaders: ["Content-Type", "Authorization"], // ✅ Specify headers
  })
);
app.use(express.json());
app.use(passport.initialize());

// Health check
app.get("/health", (_req, res) => res.json({ ok: true }));

// Auth routes
app.use("/auth", localAuth);
app.use("/auth", googleAuth);

// PGP Key routes
app.use("/keys", keyRoutes);

// In index.js

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: "Too many attempts, please try again later",
});

app.use("/auth/login", authLimiter);
app.use("/auth/register", authLimiter);

app.use("/messages", messagesRoutes);
// HTTP + WS server
const server = http.createServer(app);
attachWebSocket(server);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`✅ API on :${PORT}`));
