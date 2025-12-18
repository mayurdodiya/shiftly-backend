// // transactionId
// // amount
// // paymentMode: jobPost, recruiterRefund, employeePayment
// // paymentStatus

// // if paymentMode jobPost == jobPostId, recruiterId,
// // if paymentMode recruiterRefund == jobPostId, recruiterId,
// // if paymentMode employeePayment == jobPostId, employeeId,

// const mongoose = require("mongoose");

// const paymentSchema = mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "users",
//       trim: true,
//     },
   
//   },
//   {
//     timestamps: true,
//     versionKey: false,
//   }
// );

// const Payment = mongoose.model("payment", paymentSchema, "payment");
// module.exports = Payment;