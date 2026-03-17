const { UserModel } = require("../models");
const { ROLE } = require("../utils/constant");
const dbConfig = require("../config/dbConfig");

// Admin seeder.
module.exports = adminSeeder = async () => {
  try {
    const adminExist = await UserModel.findOne({ role: ROLE.ADMIN, deletedAt: null });

    if (!adminExist) {
      await UserModel.create({
        name: dbConfig.ADMIN_NAME,
        email: dbConfig.ADMIN_EMAIL,
        countryCode: dbConfig.ADMIN_COUNTRY_CODE,
        phone: dbConfig.ADMIN_PHONE,
        password: dbConfig.ADMIN_PASSWORD,
        role: ROLE.ADMIN,
      });
    }

    console.log("✅ Admin seeder run successfully...");
  } catch (error) {
    console.log("❌ Error from admin seeder :", error);
  }
};
