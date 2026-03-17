const mongoose = require("mongoose");
const dbConfig = require("../config/dbConfig");
module.exports = connectDB = async () => {
  try {
    await mongoose.connect(dbConfig.MONGODB_URL, {
      useNewUrlParser: true,
      autoIndex: true,
      useUnifiedTopology: true,
    }); // Database connected.
    console.log("✅ Database Connected successfully...");
  } catch (error) {
    console.log("❌ Database Connections Error :", error);
  }
};
