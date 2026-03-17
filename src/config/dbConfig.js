require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";

const dbConfig = {
    MONGODB_URL: isProduction ? process.env.PROD_MONGODB_URL : process.env.DEV_MONGODB_URL,
    APP_BACKEND_URL: isProduction ? process.env.APP_BACKEND_URL : process.env.APP_BACKEND_URL,
    FAST2SMS_API_KEY: isProduction ? process.env.FAST2SMS_API_KEY : process.env.FAST2SMS_API_KEY,
    
    // jwt credentials
    JWT_SECRET: isProduction ? process.env.JWT_SECRET : process.env.JWT_SECRET,
    JWT_EXPIRES_IN: isProduction ? process.env.JWT_EXPIRES_IN : process.env.JWT_EXPIRES_IN,
    
    // admin credentials
    ADMIN_NAME: isProduction ? process.env.ADMIN_NAME : process.env.ADMIN_NAME,
    ADMIN_COUNTRY_CODE: "+91",
    ADMIN_PHONE: isProduction ? process.env.ADMIN_PHONE : process.env.ADMIN_PHONE,
    ADMIN_EMAIL: isProduction ? process.env.ADMIN_EMAIL : process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: isProduction ? process.env.ADMIN_PASSWORD : process.env.ADMIN_PASSWORD,
    
    // Razorpay key (shiftly client)
    RAZORPAY_KEY_ID: isProduction ? process.env.LIVE_RAZORPAY_KEY_ID : process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: isProduction ? process.env.LIVE_RAZORPAY_KEY_SECRET : process.env.RAZORPAY_KEY_SECRET,
    IFSC_CODE: isProduction ? process.env.LIVE_IFSC_CODE : process.env.IFSC_CODE,
    RAZORPAY_WEBHOOK_SECRET: isProduction ? process.env.LIVE_RAZORPAY_WEBHOOK_SECRET : process.env.RAZORPAY_WEBHOOK_SECRET,
    RAZORPAY_ACCOUNT_NUMBER: isProduction ? process.env.LIVE_RAZORPAY_ACCOUNT_NUMBER : process.env.RAZORPAY_ACCOUNT_NUMBER,
    
    // X Razorpay key (shiftly client)
    XRAZORPAY_KEY_ID: isProduction ? process.env.LIVE_XRAZORPAY_KEY_ID : process.env.XRAZORPAY_KEY_ID,
    XRAZORPAY_KEY_SECRET: isProduction ? process.env.LIVE_XRAZORPAY_KEY_SECRET : process.env.XRAZORPAY_KEY_SECRET,
    XRAZORPAY_ACCOUNT_NUMBER: isProduction ? process.env.LIVE_XRAZORPAY_ACCOUNT_NUMBER : process.env.XRAZORPAY_ACCOUNT_NUMBER,
    
    // frontend and backend url
    APPLICATION_REDIRECT_URL: isProduction ? process.env.APPLICATION_REDIRECT_URL : process.env.APPLICATION_REDIRECT_URL,
    BACKEND_URL: isProduction ? process.env.BACKEND_URL : process.env.BACKEND_URL,

};

module.exports = dbConfig;