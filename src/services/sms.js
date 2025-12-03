const axios = require("axios");

async function sendOTP(phone, otp) {
    try {
        const res = await axios.post(
            "https://www.fast2sms.com/dev/bulkV2",
            {
                route: "otp",
                variables_values: otp,
                numbers: phone,
            },
            {
                headers: {
                    authorization: process.env.FAST2SMS_API_KEY,
                },
            }
        );

        console.log("OTP Sent:", res.data);
        return true;

    } catch (error) {
        console.error("OTP Error:", error.response?.data || error);
        return false;
    }
}

module.exports = sendOTP;
