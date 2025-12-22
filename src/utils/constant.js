const ROLE = {
  ADMIN: "admin",
  EMPLOYEE: "employee",
  HOSPITAL: "hospital",
};

const JOB_POST_PAYMENT_STATUS = {
  // Recruiter → Admin (job creation)
  RECRUITER_PAYMENT_PENDING: "recruiter_payment_pending",
  RECRUITER_PAYMENT_SUCCESS: "recruiter_payment_success",
  RECRUITER_PAYMENT_FAILED: "recruiter_payment_failed",

  // Refund → Recruiter
  RECRUITER_REFUND_PENDING: "recruiter_refund_pending",
  RECRUITER_REFUND_SUCCESS: "recruiter_refund_success",
  RECRUITER_REFUND_FAILED: "recruiter_refund_failed",

  // Employee payout
  EMPLOYEE_PAYMENT_PENDING: "employee_payment_pending",
  EMPLOYEE_PAYMENT_SUCCESS: "employee_payment_success",
  EMPLOYEE_PAYMENT_FAILED: "employee_payment_failed",
};

const APPLICATION_STATUS = {
  // APPLIED: "applied",
  PENDING: "pending",
  HIRED: "hired",  // upcoming jobs
  START_WORKING: "start", // ongoing jobs
  CANCELED: "canceled",
  COMPLETED: "completed", // completed jobs
  VERIFIED: "verified", // if verified by hospital then send payment by admin
  // EXPIRED: "expired" // expirtAt and pending status // will expiry which has no any hired applicant
  REFUND_REQUEST: "refund_requested",
  REFUND_COMPLETED: "refund_completed",
};

const RAZORPAY_PAYMENT_STATUS = {
  PENDING: "pending",
  CREATED: "created",
  AUTHORIZED: "authorized",
  CAPTURED: "captured",
  FAILED: "failed",
  REFUNDED: "refunded",
};

const PAYMENT_MODE = {
  JOB_POST_PAYMENT: "job_post_payment",
  JOB_POST_REFUND: "job_post_refund",
  APPLICANT_PAYMENT: "applicant_payment",
}

module.exports = {
  ROLE,
  APPLICATION_STATUS,
  JOB_POST_PAYMENT_STATUS,
  RAZORPAY_PAYMENT_STATUS,
  PAYMENT_MODE
};
