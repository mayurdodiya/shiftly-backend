const Razorpay = require("razorpay");
const { ROLE, PAYMENT_MODE } = require("../utils/constant");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function createContact(employee) {
    console.log(employee, '-----------------------employee')
    return await razorpay.contacts.create({
        name: employee.name,
        email: employee.email,
        contact: employee.phone,
        type: "employee",
        reference_id: `emp_${Date.now()}`, // Unique identifier for your records
    });
}

async function createFundAccount(employee) {
    return await razorpay.fundAccount.create({
        contact_id: employee.contactId,
        account_type: "bank_account",
        bank_account: {
            name: employee.name,
            ifsc: employee.ifsc,
            account_number: employee.accountNumber,
        },
    });
}

async function payoutToEmployee(fundAccountId, amount) {
    return await razorpay.payouts.create({
        account_number: process.env.RAZORPAY_ACCOUNT_NUMBER,
        fund_account_id: fundAccountId,
        amount: amount * 300, // in paise
        currency: "INR",
        mode: "IMPS", // NEFT / RTGS / IMPS
        purpose: "salary",
        queue_if_low_balance: true,
        notes: {
            employee_id: "EMP12345",
            description: "Monthly salary disbursement",
        }
    });
}

// create job post payment link (workable)
async function generatePaymentLinkForCreatePost(data) {
    try {
    const paymentLink = await razorpay.paymentLink.create({
        amount: data.amount * 100,
        currency: "INR",
        description: `Payment for Job Post create`,
        customer: {
            name: data.name,
            email: data.email,
            contact: data.phone,
        },
        notify: {
            sms: true,
            email: true,
        },
        callback_url: `${process.env.APPLICATION_REDIRECT_URL}`,
        callback_method: "get",
        
        notes: {
            paymentId: data.paymentId.toString(),
            recruiterId: data.recruiterId.toString(),
            purpose: PAYMENT_MODE.JOB_POST_PAYMENT,
            jobPostId: data.jobPostId.toString(),
            role: ROLE.HOSPITAL
        },
    });
    console.log('-------------------------------------------6')

    console.log(paymentLink.id, '--------------paymentLink.id')
    console.log(paymentLink, '--------------paymentLink')
    // response 
    //     {
    //   accept_partial: false,
    //   amount: 1000,
    //   amount_paid: 0,
    //   callback_method: 'get',
    //   callback_url: 'https://shiftly-admin.netlify.app/',
    //   cancelled_at: 0,
    //   created_at: 1765656726,
    //   currency: 'INR',
    //   customer: {
    //     contact: '8347337661',
    //     email: 'mayurdodiya1234@gmail.com',
    //     name: 'test user'
    //   },
    //   description: 'Payment for Job Post: test job for payment',
    //   expire_by: 0,
    //   expired_at: 0,
    //   first_min_partial_amount: 0,
    //   id: 'plink_RrDu1yPwDKL4U4',
    //   notes: {
    //     hospitalId: '1098765432',
    //     jobPostId: '12345678910',
    //     purpose: 'JOB_POST_PAYMENT'
    //   },
    //   notify: { email: true, sms: true, whatsapp: false },
    //   payments: null,
    //   reference_id: '',
    //   reminder_enable: false,
    //   reminders: [],
    //   short_url: 'https://rzp.io/rzp/9dfS7Mu8',
    //   status: 'created',
    //   updated_at: 1765656726,
    //   upi_link: false,
    //   user_id: '',
    //   whatsapp_link: false
    // } --------------paymentLink
    return {
        paymentId: paymentLink.id,
        paymentUrl: paymentLink.short_url,
        callback_url: paymentLink.callback_url,
        notes: paymentLink.notes,
        customer: paymentLink.customer,
        currency: paymentLink.currency,
    }
    } catch (error) {
        console.log(error,'--------------------------')
        throw error
    }
}

// generatePaymentLinkForCreatePost({})
// temp call
async function payout() {
    // 1️⃣ Create Contact
    const contact = await createContact({
        name: "Mj",
        email: "Mayurdodiya1234@gmail.com",
        phone: "+918347337661",
    });
    console.log(contact, '---------------------- contact 1');

    // 2️⃣ Create Fund Account
    const fundAccount = await createFundAccount({
        name: "Mj Test",
        ifsc: "HDFC0000123",      // valid format IFSC
        accountNumber: "123456789012",
        contactId: contact.id,
    });
    console.log(fundAccount, '---------------------- fundAccount 2');

    // 3️⃣ Create Payout
    const payout = await payoutToEmployee(fundAccount.id, amount);

    console.log(payout, '-------------------------------payout 3')
}
// payout()
//------------------------------------------------------------

// --- DIAGNOSTICS: Check SDK Version & Location ---
// This block will tell you EXACTLY which file your project is loading.
// try {
//     const pkg = require('razorpay/package.json');
//     console.log("===================================================");
//     console.log(`📂 Current Working Directory: ${process.cwd()}`);
//     console.log(`📦 Loaded Razorpay SDK Version: ${pkg.version}`);
//     try {
//         console.log(`📍 SDK Location: ${require.resolve('razorpay')}`);
//     } catch (e) { console.log("📍 SDK Location: Unknown"); }
//     console.log("===================================================");

//     if (pkg.version.startsWith('1.')) {
//         console.error("\n[CRITICAL FAILURE] You are using Razorpay v1.x. Payouts require v2.9.x or higher.");
//         console.error("SOLUTION: Open your terminal in the 'Current Working Directory' shown above and run:");
//         console.error("npm install razorpay@latest\n");
//     }
// } catch (e) {
//     console.log("Could not detect Razorpay version info.");
// }

// --- Configuration & Initialization ---

// const RAZORPAY_BUSINESS_ACCOUNT_NUMBER = process.env.RAZORPAY_ACCOUNT_NUMBER;
// 1. Critical Check: Only initialize Razorpay if keys are present


// --- DEEP DEBUG: Inspect Instance ---
// if (razorpay) {
//     if (!razorpay.contacts) {
//         console.error("\n[CRITICAL ERROR] razorpay.contacts is UNDEFINED.");
//         console.error("This confirms the loaded SDK version is outdated.");
//         // We do not exit here to allow the logs above to be seen
//     } else {
//         console.log("✅ Razorpay SDK initialized correctly with Payouts support.");
//     }
// }


// --- Step 1: Create a Contact ---
async function createContact(employee) {
    try {
        console.log(`\n1. Creating Contact for: ${employee.name}`);

        if (!razorpay) throw new Error("Razorpay client is not available.");

        // Explicit check before crash
        if (!razorpay.contacts) {
            throw new Error("SDK Error: 'contacts' method is missing. Update your 'razorpay' package.");
        }

        const contact = await razorpay.contacts.create({
            name: employee.name,
            email: employee.email,
            contact: employee.phone,
            type: "employee",
            reference_id: `emp_${Date.now()}`,
        });
        console.log(`-> Contact created successfully. ID: ${contact.id}`);
        return contact;
    } catch (error) {
        console.error("Error creating contact:", error.error ? error.error.description : error.message);
        throw error;
    }
}

// --- Step 2: Create a Fund Account ---
async function createFundAccount(contactId, employee) {
    try {
        console.log("\n2. Creating Fund Account...");
        if (!razorpay) throw new Error("Razorpay client is not available.");

        const fundAccount = await razorpay.fundAccounts.create({
            contact_id: contactId,
            account_type: "bank_account",
            bank_account: {
                name: employee.name,
                ifsc: employee.ifsc,
                account_number: employee.accountNumber,
            },
        });
        console.log(`-> Fund Account created successfully. ID: ${fundAccount.id}`);
        return fundAccount;
    } catch (error) {
        console.error("Error creating fund account:", error.error ? error.error.description : error.message);
        throw error;
    }
}

// --- Step 3: Initiate the Payout ---
async function payoutToEmployee(fundAccountId, amountINR) {
    try {
        console.log(`\n3. Initiating Payout of INR ${amountINR} to Fund Account ID: ${fundAccountId}`);
        if (!razorpay) throw new Error("Razorpay client is not available.");

        const amountInPaise = Math.round(amountINR * 100);

        const payout = await razorpay.payouts.create({
            // NOTE: In Test Mode, use '2323230048123232' as the account number.
            account_number: RAZORPAY_BUSINESS_ACCOUNT_NUMBER,
            fund_account_id: fundAccountId,
            amount: amountInPaise,
            currency: "INR",
            mode: "IMPS",
            purpose: "salary",
            queue_if_low_balance: true,
            notes: {
                employee_id: "EMP12345",
                description: "Monthly salary disbursement",
            }
        });

        console.log(`-> Payout initiated successfully. Payout ID: ${payout.id}`);
        console.log(`-> Status: ${payout.status}`);
        return payout;
    } catch (error) {
        console.error("Error during Payout initiation:", error.error ? error.error.description : error.message);
        throw error;
    }
}

// --- Main Execution Workflow ---
async function runPayoutWorkflow() {
    const employeeData = {
        name: "Ramesh Sharma",
        email: "ramesh.sharma@example.com",
        phone: "9876543210",
        ifsc: "HDFC0000001",
        accountNumber: "7654321098765432",
        payoutAmount: 1000.50,
    };

    if (!RAZORPAY_BUSINESS_ACCOUNT_NUMBER) {
        console.error("\nFATAL ERROR: RAZORPAY_ACCOUNT_NUMBER is not set.");
        return;
    }

    try {
        // 1. Create Contact
        const contactResponse = await createContact(employeeData);
        const contactId = contactResponse.id;

        // 2. Create Fund Account
        const fundAccountResponse = await createFundAccount(contactId, employeeData);
        const fundAccountId = fundAccountResponse.id;

        // 3. Initiate Payout
        const payoutResponse = await payoutToEmployee(fundAccountId, employeeData.payoutAmount);

        console.log("\n--- Workflow Complete ---");
        console.log(`Final Payout Status: ${payoutResponse.status}`);
        console.log("Check your Razorpay dashboard for transaction details.");

    } catch (error) {
        console.error("\n*** Payout Workflow Failed ***");
        console.error(error);
    }
}

// if (require.main === module) {
//     if (razorpay) {
//         runPayoutWorkflow();
//     }
// }
//----------------------------------------------------------

module.exports = {
    createContact,
    createFundAccount,
    payoutToEmployee,
    generatePaymentLinkForCreatePost
};



// webhook
// app.post("/webhook/razorpay", (req, res) => {
//   const event = req.body.event;

//   if (event === "payout.processed") {
//     // mark payment success
//   }

//   if (event === "payout.failed") {
//     // retry or alert admin
//   }

//   res.status(200).send("OK");
// });
// test razorpay upi: success@razorpay

// api documention WORKING
// payout guid video/docs ==> https://razorpay.com/docs/api/x/
// payout guid youtube==> https://www.youtube.com/watch?v=SiViFEyyS6o
// 1-------------------------- create contact in postman 
// postman request POST 'https://api.razorpay.com/v1/contacts' \
//   --header 'Content-Type: application/json' \
//   --header 'Authorization: Basic cnpwX3Rlc3RfUnBWaUJWWlpiNno0WUc6c010NXcwbEpxdjNVOXdVTXEwaDR1R1hB' \
//   --body '{
//     "name": "Gaurav Kumar",
//     "email": "mayur320.rejoice@gmail.com",
//     "contact": "8347337661",
//     "type": "employee",
//     "reference_id": "Acme Contact ID 12345",
//     "notes":{
//     "notes_key_1":"Tea, Earl Grey, Hot",
//     "notes_key_2":"Tea, Earl Grey… decaf."
//   }

// }' \
//   --auth-basic-username 'rzp_test_RpViBVZZb6z4YG' \
//   --auth-basic-password 'sMt5w0lJqv3U9wUMq0h4uGXA'

// 11 ------------------------------- response
// {
//     "id": "cont_RrO1w0AgEQK3yY",
//     "entity": "contact",
//     "name": "Gaurav Kumar",
//     "contact": "8347337661",
//     "email": "mayur320.rejoice@gmail.com",
//     "type": "employee",
//     "reference_id": "Acme Contact ID 12345",
//     "batch_id": null,
//     "active": true,
//     "notes": [],
//     "created_at": 1765692391
// }

// 2 ---------------------------------------------- create fund account
// postman request POST 'https://api.razorpay.com/v1/fund_accounts' \
//   --header 'Content-Type: application/json' \
//   --header 'Authorization: Basic cnpwX3Rlc3RfUnBWaUJWWlpiNno0WUc6c010NXcwbEpxdjNVOXdVTXEwaDR1R1hB' \
//   --body '{
    //     "contact_id": "cont_RrO1w0AgEQK3yY",
    //     "account_type": "bank_account",
    //     "bank_account": {
        //         "name": "Gaurav Kumar",
        //         "ifsc": "HDFC0000053",
        //         "account_number": "765432123456789"
        //     }
        // }' \
        //   --auth-basic-username 'rzp_test_RpViBVZZb6z4YG' \
        //   --auth-basic-password 'sMt5w0lJqv3U9wUMq0h4uGXA'

// 22 ---------------------------------------------- fund account response
// {
//     "id": "fa_RrOLU026Cgaow5",
//     "entity": "fund_account",
//     "contact_id": "cont_RrO1w0AgEQK3yY",
//     "account_type": "bank_account",
//     "bank_account": {
//         "ifsc": "HDFC0000053",
//         "bank_name": "HDFC Bank",
//         "name": "Gaurav Kumar",
//         "notes": [],
//         "account_number": "765432123456789"
//     },
//     "batch_id": null,
//     "active": true,
//     "created_at": 1765693501
// }
        
// 3 ----------------------- payout
// postman request POST 'https://api.razorpay.com/v1/payouts' \
//   --header 'Content-Type: application/json' \
//   --header 'Authorization: Basic cnpwX3Rlc3RfUnBWaUJWWlpiNno0WUc6c010NXcwbEpxdjNVOXdVTXEwaDR1R1hB' \
//   --body '{
    //     "account_number": "2323230018980600",  
    //     "fund_account_id": "fa_RrOLU026Cgaow5",  
    //     "amount": 1000000,
    //     "currency": "INR",
    //     "mode": "UPI",
    //     "purpose": "refund",
    //     "queue_if_low_balance": true,
    //     "reference_id": "Acme Transaction ID 12345",
    //     "narration": "Acme Corp Fund Transfer",
    //     "notes": {
        //         "notes_key_1": "Tea, Earl Grey, Hot",
        //         "notes_key_2": "Tea, Earl Grey… decaf."
        //     }
        // }' \
        //   --auth-basic-username 'rzp_test_RpViBVZZb6z4YG' \
        //   --auth-basic-password 'sMt5w0lJqv3U9wUMq0h4uGXA'
        
        
// 4 ----------------------- payout direct no tension
// curl -u <YOUR_KEY>:<YOUR_SECRET> \
// -X POST https://api.razorpay.com/v1/payouts \
// -H "Content-Type: application/json" \
// -H "X-Payout-Idempotency: 53cda91c-8f81-4e77-bbb9-7388f4ac6bf4" \
// -d '{
//     "account_number": "7878780080316316",
//     "amount": 1000000,
//     "currency": "INR",
//     "mode": "NEFT",
//     "purpose": "refund",
//     "fund_account": {
//         "account_type": "bank_account",
//         "bank_account": {
//             "name": "Gaurav Kumar",
//             "ifsc": "HDFC0001234",
//             "account_number": "1121431121541121"
//         },
//         "contact": {
//             "name": "Gaurav Kumar",
//             "email": "gaurav.kumar@example.com",
//             "contact": "9876543210",
//             "type": "vendor",
//             "reference_id": "Acme Contact ID 12345",
//             "notes": {
//                 "notes_key_1": "Tea, Earl Grey, Hot",
//                 "notes_key_2": "Tea, Earl Grey… decaf."
//             }
//         }
//     },
//     "queue_if_low_balance": true,
//     "reference_id": "Acme Transaction ID 12345",
//     "narration": "Acme Corp Fund Transfer",
//     "notes": {
//         "notes_key_1": "Beam me up Scotty",
//         "notes_key_2": "Engage"
//     }
// }'