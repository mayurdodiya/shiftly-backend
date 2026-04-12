const axios = require('axios');

// send otp for 10am to 9pm only
const sendOTPOfficialTime = async (mobileNumber) => {
    try {
        const MSG91_TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID
        const response = await axios.post(
            'https://control.msg91.com/api/v5/otp',
            {
                template_id: MSG91_TEMPLATE_ID || '69d7d483db092199ac030cd4',
                mobile: `91${mobileNumber}`,
                otp_length: 4,
                otp_expiry: 10,
            },
            {
                headers: {
                    authkey: '502722sdcdAQk6M69d67ea4P1',
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const sendOTP = async (mobileNumber, otp) => {
    try {
        const MSG91_TEMPLATE_ID_FOR_24_HOURS = process.env.MSG91_TEMPLATE_ID_FOR_24_HOURS
        const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY
        const response = await axios.post(
            `https://control.msg91.com/api/v5/otp?template_id=${MSG91_TEMPLATE_ID_FOR_24_HOURS}&mobile=91${mobileNumber}&authkey=${MSG91_AUTH_KEY}`,
            {
                Param1: otp,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        console.log('OTP Sent:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        throw error.response?.data || error.message;
    }
};


module.exports = sendOTP;
