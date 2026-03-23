const mongoose = require("mongoose");

const otpSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      required: true,
      trim: true,
    },
    otp: {
      type: String,
      trim: true,
      required: true,
    },
    isVerify: {
      type: Boolean,
      default: false,
    },
    expiryTime: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
/**
 * Check if phone is taken
 * @param {string} phone - The user's phone
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
otpSchema.statics.isPhoneTaken = async function (phone, excludeUserId) {
  const user = await this.findOne({ phone, _id: { $ne: excludeUserId } });
  return !!user;
};
otpSchema.index({ expiryTime: 1 }, { expireAfterSeconds: 0 });
const Otp = mongoose.model("otp", otpSchema, "otp");
module.exports = Otp;