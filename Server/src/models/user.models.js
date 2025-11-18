import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, index: true, unique: true, sparse: true },
  passwordHash: { type: String },                 // for local email/password
  googleId: { type: String, unique: true, sparse: true },
  displayName: String,
  publicKeyArmored: String,                       // your PGP public key
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
