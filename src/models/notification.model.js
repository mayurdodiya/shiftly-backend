const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", default: null },
    title: { type: String, default: null },
    body: { type: String, default: null },
    type: { type: String, default: "text" },
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
