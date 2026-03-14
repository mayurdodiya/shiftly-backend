const cron = require("node-cron");
const { NotificationModel, JobPostModel, UserModel } = require("../models");
const { JOB_POST_PAYMENT_STATUS, APPLICATION_STATUS, ROLE, PAYMENT_MODE, RAZORPAY_PAYMENT_STATUS } = require("../utils/constant");
const Payment = require("../models/payment.model");
const { razorpayX } = require("../services/razorpayX"); // ← only razorpayX needed here


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
});

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
});


// Cron job: Employee salary payout — runs every day at midnight
// cron.schedule("0 0 * * *", async () => {
cron.schedule("10 30 * * * *", async () => {
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

        console.log(eligibleJobs[0].hiredApplicantId?.bankDetail, '------------------ find obs for employee payments')
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
                    console.log(`✅ Fund account created: ${fundAccount.id}`);
                } catch (err) {
                    console.log(`❌ Failed to create fund account for employee ${employee._id}:`, err.message);
                    continue;
                }

                // 5. Initiate payout via RazorpayX
                let payout;
                try {
                    payout = await razorpayX.payouts.create({  // ← razorpayX
                        account_number: process.env.XRAZORPAY_ACCOUNT_NUMBER,
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
//     try {
//         console.log("💸 Employee payout cron started...");

//         // 1. Find all eligible job posts
//         const eligibleJobs = await JobPost.find({
//             status: APPLICATION_STATUS.VERIFIED,
//             paymentStatus: {
//                 $eq: JOB_POST_PAYMENT_STATUS.RECRUITER_PAYMENT_SUCCESS,
//                 $ne: JOB_POST_PAYMENT_STATUS.EMPLOYEE_PAYMENT_SUCCESS
//             },
//             hiredApplicantId: { $ne: null },
//             jobEndDate: { $lte: new Date() }, // job must be completed
//         }).populate("hiredApplicantId"); // get employee details

//         console.log(`📋 Found ${eligibleJobs.length} eligible jobs for payout`);

//         for (const job of eligibleJobs) {
//             try {
//                 const employee = job.hiredApplicantId; // populated user

//                 // 2. Validate employee bank details
//                 if (!employee?.bankDetail?.accountNumber || !employee?.bankDetail?.ifscCode || !employee?.bankDetail?.accountHolderName) {
//                     console.warn(`⚠️ Skipping job ${job._id} — employee ${employee._id} has incomplete bank details`);
//                     // send mail to employee to update bank details
//                     //  await sendEmail({
//                     //     to: employee.email,
//                     //     subject: "Action required: Update your bank details for salary payout",
//                     //     text: `Dear ${employee.name},\n\nWe noticed that your bank details are incomplete. Please update your bank information in your profile to receive your salary payout for job ${job._id}.\n\nThank you,\nShiftly Team`,
//                     //     html: `<p>Dear ${employee.name},</p><p>We noticed that your bank details are incomplete. Please update your bank information in your profile to receive your salary payout for job ${job._id}.</p><p>Thank you,<br/>Shiftly Team</p>`,
//                     // });
//                     continue;
//                 }

//                 const amountInPaise = Math.round(job.employeeSalary * 100); // Razorpay uses paise

//                 // 3. Create contact on RazorpayX (if not exists)
//                 let contact;
//                 try {
//                     contact = await razorpay.contacts.create({
//                         name: employee.name || employee.bankDetail.accountHolderName,
//                         email: employee.email,
//                         contact: employee.phone,
//                         type: "employee",
//                         reference_id: employee._id.toString(),
//                     });
//                     console.log(`✅ Contact created: ${contact.id}`);
//                 } catch (err) {
//                     console.error(`❌ Failed to create contact for employee ${employee._id}:`, err.message);
//                     continue;
//                 }

//                 // 4. Create fund account (bank account)
//                 let fundAccount;
//                 try {
//                     fundAccount = await razorpay.fundAccount.create({
//                         contact_id: contact.id,
//                         account_type: "bank_account",
//                         bank_account: {
//                             name: employee.bankDetail.accountHolderName,
//                             ifsc: employee.bankDetail.ifscCode,
//                             account_number: employee.bankDetail.accountNumber,
//                         },
//                     });
//                     console.log(`✅ Fund account created: ${fundAccount.id}`);
//                 } catch (err) {
//                     console.error(`❌ Failed to create fund account for employee ${employee._id}:`, err.message);
//                     continue;
//                 }

//                 // 5. Initiate payout via RazorpayX
//                 let payout;
//                 try {
//                     payout = await razorpay.payouts.create({
//                         account_number: process.env.RAZORPAY_ACCOUNT_NUMBER, // your admin X account
//                         fund_account_id: fundAccount.id,
//                         amount: amountInPaise,
//                         currency: "INR",
//                         mode: "IMPS",
//                         purpose: "salary",
//                         queue_if_low_balance: true,
//                         reference_id: job._id.toString(),
//                         narration: `Shiftly salary payout - Job ${job._id}`,
//                     });
//                     console.log(`✅ Payout initiated: ${payout.id} | Status: ${payout.status}`);
//                 } catch (err) {
//                     console.error(`❌ Payout failed for job ${job._id}:`, err.message);
//                     continue;
//                 }

//                 // 6. Save payment record in DB
//                 const adminUser = await User.findOne({ role: ROLE.ADMIN }); // assuming there's only one admin

//                 const paymentRecord = await Payment.create({
//                     senderId: adminUser._id,
//                     receiverId: employee._id,
//                     jobPostId: job._id,
//                     transactionId: payout.id,
//                     amount: job.employeeSalary,
//                     paymentMode: PAYMENT_MODE.APPLICANT_PAYMENT,
//                     paymentStatus: payout.status === "processed"
//                         ? RAZORPAY_PAYMENT_STATUS.CAPTURED
//                         : RAZORPAY_PAYMENT_STATUS.PENDING,
//                 });

//                 // 7. Update job post
//                 await JobPost.findByIdAndUpdate(job._id, {
//                     employeePaymentId: paymentRecord._id,
//                     paymentStatus: payout.status === "processed"
//                         ? JOB_POST_PAYMENT_STATUS.EMPLOYEE_PAYMENT_SUCCESS
//                         : JOB_POST_PAYMENT_STATUS.EMPLOYEE_PAYMENT_PENDING,
//                 });

//                 console.log(`✅ Job ${job._id} — payout ₹${job.employeeSalary} to ${employee.name} done`);

//             } catch (jobError) {
//                 console.error(`❌ Error processing job ${job._id}:`, jobError.message);
//                 // continue with next job even if one fails
//             }
//         }

//         console.log("✅ Employee payout cron completed.");
//     } catch (error) {
//         console.error("❌ Fatal error in payout cron:", error);
//     }
// });