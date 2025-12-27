import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  otp: { type: String, required: true },
  verified: { type: Boolean, default: false }, // <-- add this
  expiresAt: { type: Date, required: true },
});

const OTP = mongoose.model("OTP", otpSchema);
export default OTP;
