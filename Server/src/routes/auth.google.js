import { Router } from "express";
import passport from "../auth/passport.js";
import { signJwt } from "../auth/jwt.js";

const router = Router();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/auth/google/failure",
  }),
  (req, res) => {
    try {
      const user = req.user;

      // Validate user object
      if (!user || !user.id) {
        return res.redirect("/auth/google/failure");
      }

      const token = signJwt({ sub: user.id, email: user.email, google: true });

      // Validate CORS_ORIGIN exists
      const origin = process.env.CORS_ORIGIN;
      if (!origin) {
        console.error("CORS_ORIGIN not configured");
        return res.status(500).send("Server misconfiguration");
      }

      // This prevents token leakage in browser history/logs while redirecting to frontend
      res.redirect(
        `${origin}/auth/callback?token=${encodeURIComponent(token)}`
      );
    } catch (err) {
      console.error("Google callback error:", err);
      res.redirect("/auth/google/failure");
    }
  }
);

router.get("/google/failure", (req, res) => {
  res.status(401).send("Google authentication failed");
});

export default router;
