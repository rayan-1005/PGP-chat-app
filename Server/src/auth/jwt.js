import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

const APP_NAME = process.env.APP_NAME || "pgp-chat-app";

export function verifyJwt(token) {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET not configured");
  }
  if (!token) {
    throw new Error("No token provided");
  }
  return jwt.verify(token, JWT_SECRET, {
    issuer: APP_NAME,
    audience: APP_NAME,
  });
}

export function signJwt(payload) {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET not configured");
  }
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
    issuer: APP_NAME,
    audience: APP_NAME,
  });
}
