import { Router } from "express";
import mongoose from "mongoose"; // ✅ Add this import
import User from "../models/user.models.js";
import { verifyJwt } from "../auth/jwt.js";

const router = Router();

// Attach auth middleware
function requireAuth(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  try {
    if (!token) throw new Error("missing token");
    req.user = verifyJwt(token);
    next();
  } catch (err) {
    res.status(401).json({ error: "unauthorized" });
  }
}

/** POST /keys  { publicKeyArmored } (auth) */
router.post("/", requireAuth, async (req, res) => {
  try {
    const { publicKeyArmored } = req.body;
    if (!publicKeyArmored) {
      return res.status(400).json({ error: "missing key" });
    }

    // ✅ Validate PGP key format
    if (!publicKeyArmored.includes("BEGIN PGP PUBLIC KEY BLOCK")) {
      return res.status(400).json({ error: "invalid PGP key format" });
    }

    // ✅ Limit key size (prevent DoS)
    if (publicKeyArmored.length > 20000) {
      return res.status(400).json({ error: "key too large (max 20KB)" });
    }

    await User.findByIdAndUpdate(req.user.sub, { publicKeyArmored });
    res.json({ success: true });
  } catch (err) {
    console.error("Update key error:", err);
    res.status(500).json({ error: "failed to update key" });
  }
});

/** GET /keys -> list all users */
router.get("/", async (req, res) => {
  try {
    const users = await User.find({}, "_id displayName email").lean();
    res.json(users);
  } catch (err) {
    console.error("List users error:", err);
    res.status(500).json({ error: "failed to list users" });
  }
});

/** GET /keys/:userId  -> { publicKeyArmored } */
router.get("/:userId", async (req, res) => {
  try {
    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ error: "invalid user id" });
    }

    const u = await User.findById(req.params.userId).select(
      "publicKeyArmored displayName"
    );
    if (!u?.publicKeyArmored) {
      return res.status(404).json({ error: "key not found" });
    }

    res.json({
      publicKeyArmored: u.publicKeyArmored,
      displayName: u.displayName,
    });
  } catch (err) {
    console.error("Get key error:", err);
    res.status(500).json({ error: "failed to fetch key" });
  }
});

export default router;
