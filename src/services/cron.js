const cron = require("node-cron");
const { NotificationModel, JobPostModel, UserModel } = require("../models");
const { JOB_POST_PAYMENT_STATUS, APPLICATION_STATUS, ROLE, PAYMENT_MODE, RAZORPAY_PAYMENT_STATUS } = require("../utils/constant");
const Payment = require("../models/payment.model");
const { razorpayX } = require("../services/razorpayX"); // ← only razorpayX needed here
const dbConfig = require("../config/dbConfig");


// Cron job: Employee salary payout — runs every day at midnight
// Cron job: Runs every night at 11:30 PM
cron.schedule("30 23 * * *", async () => {
    try {
        console.log("Cron job started.")
        let oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        const result = await NotificationModel.deleteMany({
            createdAt: { $lt: oneMonthAgo }
        });

        console.log(`🗑️ Deleted ${result.deletedCount} old notifications.`);
    } catch (error) {
        console.error("❌ Error deleting old notifications:", error);
    }
},
    {
        timezone: "Asia/Kolkata" // Set timezone to IST
    }
);


// Cron job: Employee salary payout — runs every day at midnight
// cron.schedule("0 0 * * *", async () => {
cron.schedule("40 23 * * *", async () => {
    try {
        console.log("💸 Employee payout cron started...");

        // 1. Find all eligible job posts
        const eligibleJobs = await JobPostModel.find({
            status: APPLICATION_STATUS.VERIFIED,
            paymentStatus: {
                $eq: JOB_POST_PAYMENT_STATUS.RECRUITER_PAYMENT_SUCCESS,
                $ne: JOB_POST_PAYMENT_STATUS.EMPLOYEE_PAYMENT_SUCCESS
            },
            hiredApplicantId: { $ne: null },
            jobEndDate: { $lte: new Date() },
        }).populate("hiredApplicantId");

        console.log(eligibleJobs, '------------------ find obs for employee payments')
        console.log(`📋 Found ${eligibleJobs.length} eligible jobs for payout`);

        for (const job of eligibleJobs) {
            try {
                const employee = job.hiredApplicantId;

                // 2. Validate employee bank details
                if (!employee?.bankDetail?.accountNumber || !employee?.bankDetail?.ifscCode || !employee?.bankDetail?.accountHolderName) {
                    console.warn(`⚠️ Skipping job ${job._id} — employee ${employee._id} has incomplete bank details`);
                    continue;
                }

                const amountInPaise = Math.round(job.employeeSalary * 100);

                // 3. Create contact on RazorpayX
                let contact;
                try {
                    const obj = {
                        name: employee.name || employee.bankDetail.accountHolderName,
                        email: employee.email,
                        contact: employee.phone,
                        type: "employee",
                        reference_id: employee._id.toString(),
                    }
                    console.log('Creating contact with data:', obj);
                    contact = await razorpayX.contacts.create(obj);
                    console.log(`✅ Contact created: ${contact.id}`);
                } catch (err) {
                    console.log(`❌ Failed to create contact for employee ${employee._id}:`, err.message);
                    continue;
                }

                // 4. Create fund account
                let fundAccount;
                try {
                    fundAccount = await razorpayX.fundAccount.create({  // ← razorpayX
                        contact_id: contact.id,
                        account_type: "bank_account",
                        bank_account: {
                            name: employee.bankDetail.accountHolderName,
                            ifsc: employee.bankDetail.ifscCode,
                            account_number: employee.bankDetail.accountNumber,
                        },
                    });
                    console.log(fundAccount, '------------------')
                    console.log(`✅ Fund account created: ${fundAccount.id}`);
                } catch (err) {
                    console.log(`❌ Failed to create fund account for employee ${employee._id}:`, err.message);
                    continue;
                }

                // 5. Initiate payout via RazorpayX
                let payout;
                try {
                    payout = await razorpayX.payouts.create({  // ← razorpayX
                        account_number: dbConfig.XRAZORPAY_ACCOUNT_NUMBER,
                        fund_account_id: fundAccount.id,
                        amount: amountInPaise,
                        currency: "INR",
                        mode: "NEFT", // NEFT, IMPS
                        purpose: "payout",
                        queue_if_low_balance: true,
                        reference_id: job._id.toString(),
                        narration: `salary payout`,
                    });
                    console.log(`✅ Payout initiated: ${payout.id} | Status: ${payout.status}`);
                } catch (err) {
                    console.log(`❌ Payout failed for job ${job._id}:`, err.response?.data || err.message);
                    continue;
                }

                // 6. Save payment record in DB
                const adminUser = await UserModel.findOne({ role: ROLE.ADMIN });

                const paymentRecord = await Payment.create({
                    senderId: adminUser._id,
                    receiverId: employee._id,
                    jobPostId: job._id,
                    transactionId: payout.id,
                    amount: job.employeeSalary,
                    paymentMode: PAYMENT_MODE.APPLICANT_PAYMENT,
                    paymentStatus: payout.status === "processed" ? RAZORPAY_PAYMENT_STATUS.CAPTURED : RAZORPAY_PAYMENT_STATUS.PENDING,
                });

                // 7. Update job post
                await JobPostModel.findByIdAndUpdate(job._id, {
                    employeePaymentId: paymentRecord._id,
                    paymentStatus: payout.status === "processed"
                        ? JOB_POST_PAYMENT_STATUS.EMPLOYEE_PAYMENT_SUCCESS
                        : JOB_POST_PAYMENT_STATUS.EMPLOYEE_PAYMENT_PENDING,
                });

                console.log(`✅ Job ${job._id} — payout ₹${job.employeeSalary} to ${employee.name} done`);

            } catch (err) {
                console.log(`❌ Error processing job ${job._id}:`, err.message);
            }
        }

        console.log("✅ Employee payout cron completed.");
    } catch (error) {
        console.error("❌ Fatal error in payout cron:", error);
    }
},
    {
        timezone: "Asia/Kolkata" // Set timezone to IST
    }
);



// error of razorpay x acc --------

// 💸 Employee payout cron started...
// [
//   {
//     experience: { min: 1, max: 3 },
//     location: {
//       city: 'surat',
//       state: 'gujarat',
//       country: 'india',
//       address: 'varachha surat gujarat india',
//       latitude: 21.2021189,
//       longitude: 72.8672703
//     },
//     _id: new ObjectId("69b993d11c3a1ff713087c8c"),
//     recruiterId: new ObjectId("69b5bf1765d1c05dbc86d3a7"),
//     title: 'test for razorpay x acc',
//     description: 'test for razorpay x acc',
//     profession: 'staff nurse',
//     skills: [ 'test payment in live mode' ],
//     salary: 1,
//     adminFee: 0.05,
//     employeeSalary: 0.95,
//     shiftStartTime: '09:00',
//     shiftEndTime: '21:00',
//     jobStartDate: 2026-02-20T00:00:00.000Z,
//     jobEndDate: 2026-02-25T00:00:00.000Z,
//     totalDays: 6,
//     hiredApplicantId: {
//       bankDetail: [Object],
//       _id: new ObjectId("69b5be0418e49feceee10fde"),
//       name: 'mayurdodiya',
//       role: 'employee',
//       countryCode: '+91',
//       phone: '8347337661',
//       email: 'mayurdodiya1234@gmail.com',
//       profession: 'staff nurse',
//       education: 'ANM (Auxiliary Nurse Midwife)',
//       educationDoc: [Array],
//       resumeUrl: 'https://shiftly-bucket.s3.ap-south-1.amazonaws.com/upload-1773518339497-328.octet-stream',
//       experience: 1,
//       city: 'visakhapatnam',
//       state: 'andhra pradesh',
//       fcmToken: 'dekfnefcekm',
//       isActive: true,
//       deletedAt: null,
//       createdAt: 2026-03-14T19:59:00.371Z,
//       updatedAt: 2026-03-14T20:34:12.194Z
//     },
//     status: 'verified',
//     recruiterPaymentId: new ObjectId("69b993d11c3a1ff713087c91"),
//     recruiterRefundPaymentId: null,
//     employeePaymentId: null,
//     paymentStatus: 'recruiter_payment_success',
//     expireAt: 2026-03-19T23:00:00.000Z,
//     isActive: true,
//     createdAt: 2026-03-17T17:48:01.349Z,
//     updatedAt: 2026-03-17T17:49:56.139Z
//   }
// ] ------------------ find obs for employee payments
// 📋 Found 1 eligible jobs for payout
// Creating contact with data: {
//   name: 'mayurdodiya',
//   email: 'mayurdodiya1234@gmail.com',
//   contact: '8347337661',
//   type: 'employee',
//   reference_id: '69b5be0418e49feceee10fde'
// }
// ✅ Contact created: cont_SSOE0szZNEd8uE
// {
//   id: 'fa_SSOE1XbHgitA3K',
//   entity: 'fund_account',
//   contact_id: 'cont_SSOE0szZNEd8uE',
//   account_type: 'bank_account',
//   bank_account: {
//     ifsc: 'HDFC0001234',
//     bank_name: 'HDFC Bank',
//     name: 'mayurdodiya',
//     notes: [],
//     account_number: '28345538142'
//   },
//   batch_id: null,
//   active: true,
//   created_at: 1773771661
// } ------------------
// ✅ Fund account created: fa_SSOE1XbHgitA3K
// RazorpayX Payout Error: {
//   "error": {
//     "code": "BAD_REQUEST_ERROR",
//     "description": "The requested URL was not found on the server.",
//     "source": null,
//     "step": null,
//     "reason": null,
//     "metadata": {}
//   }
// }
// ❌ Payout failed for job 69b993d11c3a1ff713087c8c: {
//   error: {
//     code: 'BAD_REQUEST_ERROR',
//     description: 'The requested URL was not found on the server.',
//     source: null,
//     step: null,
//     reason: null,
//     metadata: {}
//   }
// }
// ✅ Employee payout cron completed.