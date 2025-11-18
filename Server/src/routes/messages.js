import { Router } from "express";
import Message from "../models/message.models.js";
import { verifyJwt } from "../auth/jwt.js";
import mongoose from "mongoose";
const router = Router();

// Auth middleware for Bearer tokens
router.use((req, res, next) => {
  const token = (req.headers.authorization || "").replace(/^Bearer /, "");
  try {
    req.user = verifyJwt(token);
    next();
  } catch {
    res.status(401).json({ error: "unauthorized" });
  }
});

// GET /messages/:peerId → all encrypted messages between 2 users
router.get("/:peerId", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.peerId)) {
      return res.status(400).json({ error: "invalid peer id" });
    }

    const me = req.user.sub;
    const peer = req.params.peerId;

    if (me === peer) {
      return res.status(400).json({ error: "cannot message yourself" });
    }

    const messages = await Message.find({
      $or: [
        { fromUserId: me, toUserId: peer },
        { fromUserId: peer, toUserId: me },
      ],
    }).sort({ ts: 1 });
    res.json(messages);
  } catch (err) {
    console.error("Get messages error:", err);
    res.status(500).json({ error: "failed to fetch messages" });
  }
});

router.post("/:peerId", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.peerId)) {
      return res.status(400).json({ error: "invalid peer id" });
    }

    const { ciphertext } = req.body;
    if (!ciphertext) {
      return res.status(400).json({ error: "ciphertext required" });
    }

    const me = req.user.sub;
    const peer = req.params.peerId;

    if (me === peer) {
      return res.status(400).json({ error: "cannot message yourself" });
    }

    const message = await Message.create({
      fromUserId: me,
      toUserId: peer,
      ciphertext,
    });

    res.status(201).json(message);
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ error: "failed to send message" });
  }
});

export default router;
