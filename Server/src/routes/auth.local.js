import { Router } from 'express';
import User from '../models/user.models.js';
import { hashPassword, verifyPassword } from '../utils/hash.js';
import { signJwt } from '../auth/jwt.js';

const router = Router();

/** POST /auth/register {email, password} */
router.post('/register', async (req, res) => {
  const { email, password, displayName } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email & password required' });
  
  // ✅ Add email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'invalid email format' });
  }
  
  // ✅ Add password strength validation
  if (password.length < 8) {
    return res.status(400).json({ error: 'password must be at least 8 characters' });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'email already exists' });

    const passwordHash = await hashPassword(password);
    const user = await User.create({ email, passwordHash, displayName });
    const token = signJwt({ sub: user.id, email: user.email });
    res.json({ token, user: { id: user.id, email: user.email, displayName: user.displayName } });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'registration failed' });
  }
});

/** POST /auth/login {email, password} */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password required' });
    }
    
    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'invalid credentials' });
    }
    
    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });

    const token = signJwt({ sub: user.id, email: user.email });
    res.json({ token, user: { id: user.id, email: user.email, displayName: user.displayName } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'login failed' });
  }
});

export default router;
