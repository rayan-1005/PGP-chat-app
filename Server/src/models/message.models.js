import mongoose from "mongoose";
const MessageSchema = new mongoose.Schema({
  fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  toUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  ciphertext: String,
  ts: { type: Date, default: Date.now },
});
export default mongoose.model("Message", MessageSchema);
