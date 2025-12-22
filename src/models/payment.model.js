// if paymentMode jobPost == jobPostId, recruiterId,
// if paymentMode recruiterRefund == jobPostId, recruiterId,
// if paymentMode employeePayment == jobPostId, employeeId,

const mongoose = require("mongoose");
const { RAZORPAY_PAYMENT_STATUS, PAYMENT_MODE } = require("../utils/constant");

const paymentSchema = mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
        },
        jobPostId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "jobPost",
            default: null,
        },
        transactionId: {
            type: String,
            trim: true,
            default: null,
        },
        amount: {
            type: Number,
            default: null,
        },
        paymentMode: {
            type: String,
            enum: Object.values(PAYMENT_MODE),
            default: PAYMENT_MODE.JOB_POST_PAYMENT,
        },
        paymentStatus: {
            type: String,
            enum: Object.values(RAZORPAY_PAYMENT_STATUS),
            default: RAZORPAY_PAYMENT_STATUS.PENDING,
        }
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const Payment = mongoose.model("payment", paymentSchema, "payment");
module.exports = Payment;
