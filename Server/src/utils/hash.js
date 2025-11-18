import bcrypt from 'bcrypt';
const ROUNDS = 12;

export async function hashPassword(pw) {
  return bcrypt.hash(pw, ROUNDS);
}

export async function verifyPassword(pw, hash) {
  return bcrypt.compare(pw, hash);
}
