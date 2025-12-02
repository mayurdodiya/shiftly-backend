const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", default: null },
    title: { type: String, default: null },
    body: { type: String, default: null },
    profile: { type: String, default: null },
    type: { type: String, default: null },
    metaData: { type: String, default: null },
    isNotification: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    isRead: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Notification = new mongoose.model("notification", notificationSchema, "notification");

module.exports = Notification;
