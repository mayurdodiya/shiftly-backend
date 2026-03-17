// Flow 1: RazorpayX — for payouts (admin → employee bank account)
const axios = require("axios");
const dbConfig = require("../config/dbConfig");

const razorpayX = {

    // Create Contact
    contacts: {
        create: async (data) => {
            try {
                const response = await axios.post(
                    "https://api.razorpay.com/v1/contacts",
                    data,
                    {
                        auth: {
                            username: dbConfig.XRAZORPAY_KEY_ID,
                            password: dbConfig.XRAZORPAY_KEY_SECRET,
                        },
                    }
                );
                return response.data;
            } catch (error) {
                // Re-throw with full Razorpay error details
                const razorpayError = error.response?.data;
                console.log("RazorpayX fundAccount Error:", JSON.stringify(razorpayError, null, 2));
                throw error;
            }
        },
    },

    // Create Fund Account (employee bank account)
    fundAccount: {
        create: async (data) => {
            try {
                const response = await axios.post(
                    "https://api.razorpay.com/v1/fund_accounts",
                    data,
                    {
                        auth: {
                            username: dbConfig.XRAZORPAY_KEY_ID,
                            password: dbConfig.XRAZORPAY_KEY_SECRET,
                        },
                    }
                );
                return response.data;
            } catch (error) {
                // Re-throw with full Razorpay error details
                const razorpayError = error.response?.data;
                console.log("RazorpayX fundAccount Error:", JSON.stringify(razorpayError, null, 2));
                throw error;
            }
        },
    },

    // Initiate Payout (admin X account → employee bank)
    payouts: {
        create: async (data) => {
            try {
                const response = await axios.post(
                    "https://api.razorpay.com/v1/payouts",
                    data,
                    {
                        auth: {
                            username: dbConfig.XRAZORPAY_KEY_ID,
                            password: dbConfig.XRAZORPAY_KEY_SECRET,
                        },
                        headers: {
                            "X-Payout-Idempotency": data.reference_id, // prevent duplicate payouts
                        }
                    }
                );
                return response.data;

            } catch (error) {
                // Re-throw with full Razorpay error details
                const razorpayError = error.response?.data;
                console.log("RazorpayX Payout Error:", JSON.stringify(razorpayError, null, 2));
                throw error;
            }
        },
    },
};

module.exports = { razorpayX };