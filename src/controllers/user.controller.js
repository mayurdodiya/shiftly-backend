const message = require("../json/message.json");
const { UserModel, OtpModel, SettingModel, JobPostModel } = require("../models");
const apiResponse = require("../utils/api.response");
const { comparePassword, generateToken, getPagination, pagingData, hashPassword } = require("../utils/utils");
const { APPLICATION_STATUS, ROLE } = require("../utils/constant");
const dbConfig = require("../config/dbConfig");
// const sendOTP = require("../services/sms")

module.exports = {
  adminLogin: async (req, res) => {
    try {
      let reqBody = req.body;

      let admin = await UserModel.findOne({ email: reqBody.email, role: ROLE.ADMIN, isActive: true, deletedAt: null });
      if (!admin) return apiResponse.NOT_FOUND({ res, message: message.user_not_found });
      if (reqBody.password !== dbConfig.ADMIN_PASSWORD) return apiResponse.BAD_REQUEST({ res, message: message.invalid_credentials });

      const token = await generateToken({ userId: admin._id, email: reqBody.email });
      admin = admin.toObject()
      admin.token = token;

      return apiResponse.OK({ res, message: message.login_successful, data: admin });
    } catch (err) {
      console.log(err)
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  registerOLD: async (req, res) => {
    try {
      let reqBody = req.body;
      console.log(reqBody, 'register')

      const otpVarified = await OtpModel.findOne({ phone: reqBody.phone, isVerify: true });
      if (!otpVarified) return apiResponse.BAD_REQUEST({ res, message: message.otp_verify_pending });
      await OtpModel.deleteOne({ phone: reqBody.phone, isVerify: true });

      const phoneExist = await UserModel.findOne({ phone: reqBody.phone, isActive: true, deletedAt: null });
      if (phoneExist) return apiResponse.DUPLICATE_VALUE({ res, message: message.phone_already_taken });

      const emailExist = await UserModel.findOne({ email: reqBody.email, isActive: true, deletedAt: null });
      if (emailExist) return apiResponse.DUPLICATE_VALUE({ res, message: message.email_already_taken });

      // If file uploaded, store URL from S3
      if (req.file && req.file.location) {
        reqBody.resumeUrl = req.file.location;
        // reqBody.resumeUrl = "https://steinback.s3.amazonaws.com//upload-214.pdf";
      }

      let data = await UserModel.create({ ...reqBody });
      const token = await generateToken({ userId: data._id, phone: data.phone });
      data = data.toObject()
      data.token = token;

      return apiResponse.OK({ res, message: message.user_add_success, data });
    } catch (err) {
      console.log(err)
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },
  registerOLD1: async (req, res) => {
    try {
      let reqBody = req.body;
      console.log(reqBody, '-----------------------------')
      // return;

      // resume upload
      if (req.files?.file?.length) {
        reqBody.resumeUrl = req.files.file[0].location;
      }

      // education documents
      if (req.files?.educationDoc?.length) {
        reqBody.educationDoc = req.files.educationDoc.map(
          (file) => file.location
        );
      }

      const otpVarified = await OtpModel.findOne({ phone: reqBody.phone, isVerify: true });
      if (!otpVarified) return apiResponse.BAD_REQUEST({ res, message: message.otp_verify_pending });

      await OtpModel.deleteOne({ phone: reqBody.phone, isVerify: true });

      const phoneExist = await UserModel.findOne({ phone: reqBody.phone, isActive: true, deletedAt: null });
      if (phoneExist) return apiResponse.DUPLICATE_VALUE({ res, message: message.phone_already_taken });

      const emailExist = await UserModel.findOne({ email: reqBody.email, isActive: true, deletedAt: null });
      if (emailExist) return apiResponse.DUPLICATE_VALUE({ res, message: message.email_already_taken });

      let data = await UserModel.create({ ...reqBody });

      const token = await generateToken({ userId: data._id, phone: data.phone });

      data = data.toObject();
      data.token = token;

      return apiResponse.OK({ res, message: message.user_add_success, data });

    } catch (err) {
      console.log(err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },
  register: async (req, res) => {
    try {

      let reqBody = req.body;

      console.log(req.files);

      // resume upload
      const resumeFile = req.files.find(file => file.fieldname === "file");

      if (resumeFile) {
        reqBody.resumeUrl = resumeFile.location;
      }

      // education documents
      const educationDocs = req.files
        .filter(file => file.fieldname.startsWith("educationDoc"))
        .map(file => file.location);

      if (educationDocs.length) {
        reqBody.educationDoc = educationDocs;
      }

      const otpVarified = await OtpModel.findOne({
        phone: reqBody.phone,
        isVerify: true,
      });

      if (!otpVarified)
        return apiResponse.BAD_REQUEST({
          res,
          message: message.otp_verify_pending,
        });

      await OtpModel.deleteOne({
        phone: reqBody.phone,
        isVerify: true,
      });

      const phoneExist = await UserModel.findOne({
        phone: reqBody.phone,
        isActive: true,
        deletedAt: null,
      });

      if (phoneExist)
        return apiResponse.DUPLICATE_VALUE({
          res,
          message: message.phone_already_taken,
        });

      const emailExist = await UserModel.findOne({
        email: reqBody.email,
        isActive: true,
        deletedAt: null,
      });

      if (emailExist)
        return apiResponse.DUPLICATE_VALUE({
          res,
          message: message.email_already_taken,
        });

      let data = await UserModel.create({ ...reqBody });

      const token = await generateToken({
        userId: data._id,
        phone: data.phone,
      });

      data = data.toObject();
      data.token = token;

      return apiResponse.OK({
        res,
        message: message.user_add_success,
        data,
      });

    } catch (err) {
      console.log(err);

      return apiResponse.CATCH_ERROR({
        res,
        message: message.something_went_wrong,
      });
    }
  },

  updateFcm: async (req, res) => {
    try {
      let reqBody = req.body;
      const { user } = req;

      await UserModel.findByIdAndUpdate(user._id, { fcmToken: reqBody.fcmToken });
      return apiResponse.OK({ res, message: message.updated, });
    } catch (err) {
      console.log(err)
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  setCommissionPercentage: async (req, res) => {
    try {
      let reqBody = req.body;

      const setting = await SettingModel.findOne({ deletedAt: null });
      await SettingModel.findByIdAndUpdate(setting._id, { commission: reqBody.commission });
      return apiResponse.OK({ res, message: message.updated, });
    } catch (err) {
      console.log(err)
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  loginUser: async (req, res) => {
    try {
      const reqBody = req.body;
      let user = await UserModel.findOne({ phone: reqBody.phone, isActive: true, deletedAt: null }).select("-reset_link_expiry -deletedAt -updatedAt");

      if (!user) return apiResponse.NOT_FOUND({ res, message: message.user_not_found });

      const pwdMatch = await comparePassword({ password: reqBody.password, hash: user.password });
      if (!pwdMatch) return apiResponse.BAD_REQUEST({ res, message: message.invalid_credentials });

      const token = generateToken({ userId: user._id, email: user.email });
      const userObj = user.toObject();
      delete userObj.password;

      userObj.token = token;
      return apiResponse.OK({ res, message: message.login_success, data: userObj });
    } catch (err) {
      console.log(err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  sendOtp: async (req, res) => {
    try {
      const { phone } = req.body;
      // const sendSuccess = await sendOTP(phone, "1234")
      // console.log(sendSuccess,'--------------------sendSuccess')
      // const user = await OtpModel.findOne({ phone, deletedAt: null });
      // if (!user) {
      //   return apiResponse.NOT_FOUND({ res, message: message.phone_not_found });
      // }

      // const otp = Math.floor(1000 + Math.random() * 9000);
      const otp = "0000";
      // send otp with the tool pending******



      await Promise.all([
        OtpModel.findOneAndUpdate({ phone }, { otp: otp, expiryTime: new Date(Date.now() + 1 * 60 * 1000) }, { upsert: true, new: true }),
        // send otp in phone number
        // sendEmail({
        //   to: email,
        //   subject: "Algomatic forgot password request",
        //   text: `Your Otp is: ${otp}`,
        //   html: sendOTP(email, otp),
        // }),
      ]);

      return apiResponse.OK({ res, message: message.otp_sent_phone });
    } catch (err) {
      console.log(err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  verifyOtp: async (req, res) => {
    try {
      const { phone, otp, fcmToken } = req.body;

      const otpData = await OtpModel.findOne({ phone });
      if (!otpData) return apiResponse.NOT_FOUND({ res, message: message.phone_not_found });
      if (otpData.expiryTime < new Date()) return apiResponse.NOT_FOUND({ res, message: message.otp_expired });
      if (otpData.otp !== otp) return apiResponse.BAD_REQUEST({ res, message: message.invalid_otp });

      await OtpModel.findOneAndUpdate({ _id: otpData._id }, { $set: { expiryTime: new Date(), isVerify: true } }, { upsert: true }, { new: true });
      let user = {};
      user = await UserModel.findOne({ phone: phone }).lean();
      if (user) {
        user.isNewUser = false;
        const token = generateToken({ userId: user._id, phone: user.phone });
        user.token = token;
      } else {
        user = { isNewUser: true };
      }

      if (user.isNewUser == false) {
        await UserModel.findByIdAndUpdate(user._id, { fcmToken: fcmToken })
      }

      return apiResponse.OK({ res, message: message.otp_verified, data: user });
    } catch (err) {
      console.log(err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  changePassword: async (req, res) => {
    try {
      const { phone, newPassword, confirmPassword } = req.body;
      const user = await UserModel.findOne({ phone, isActive: true, deletedAt: null });
      if (!user) return apiResponse.NOT_FOUND({ res, message: message.phone_not_found });

      if (newPassword !== confirmPassword) {
        return apiResponse.BAD_REQUEST({ res, message: message.invalid_credentials });
      }
      const finalPassword = await hashPassword({ password: newPassword });
      await UserModel.findOneAndUpdate({ _id: user._id, deletedAt: null }, { $set: { password: finalPassword } }, { new: true });
      return apiResponse.OK({ res, message: message.password_changed });
    } catch (err) {
      console.log(err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  addUser: async (req, res) => {
    try {
      const reqBody = req.body;
      const phoneExist = await UserModel.findOne({ phone: reqBody.phone, deletedAt: null });

      if (phoneExist) return apiResponse.DUPLICATE_VALUE({ res, message: message.phone_already_taken });

      const data = await UserModel.create({ ...reqBody });
      return apiResponse.OK({ res, message: message.user_add_success, data });
    } catch (err) {
      console.log(err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  editProfile: async (req, res) => {
    try {
      const reqBody = req.body;
      console.log(reqBody, '------------------reqBody')
      const id = req.user._id;

      // phone not change
      if (reqBody.phone) delete reqBody.phone;

      // email not change
      if (reqBody.email) delete reqBody.email;

      await UserModel.findOneAndUpdate({ _id: id, isActive: true, deletedAt: null }, { $set: { ...reqBody } }, { new: true });
      return apiResponse.OK({ res, message: `User ${message.updated}` });
    } catch (err) {
      console.log(err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const id = req.params.id;
      const data = await UserModel.findByIdAndUpdate({ id, deletedAt: null }, { $set: { deletedAt: new Date() } }, { new: true });

      if (!data) return apiResponse.NOT_FOUND({ res, message: message.user_not_found });

      return apiResponse.OK({ res, message: `User ${message.deleted}` });
    } catch (err) {
      console.log(err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  getUser: async (req, res) => {
    try {
      const id = req.params.id;
      const data = await UserModel.findOne({ _id: id, deletedAt: null }).select("-password -reset_link_expiry -deletedAt -updatedAt");

      if (!data) return apiResponse.NOT_FOUND({ res, message: message.user_not_found });

      const userObj = data.toObject();
      return apiResponse.OK({ res, message: `User ${message.data_get}`, data: userObj });
    } catch (err) {
      console.log(err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  getProfile: async (req, res) => {
    try {
      const { password, ...safeUser } = req.user;
      return apiResponse.OK({ res, message: `Profile ${message.data_get}`, data: safeUser });
    } catch (err) {
      console.log(err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  getSetting: async (req, res) => {
    try {
      const data = await SettingModel.findOne({ deletedAt: null });
      return apiResponse.OK({ res, message: `Setting ${message.data_get}`, data: data });
    } catch (err) {
      console.log(err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  getAllUser: async (req, res) => {
    try {
      const { search, page, limit, isActive, role, city, state, sortField, sortOrder, } = req.query;
      const { skip, limit: pageLimit } = getPagination(page, limit);

      let filters = { deletedAt: null };

      if (search) {
        const regSearch = new RegExp(search, "i");
        filters.$or = [
          { name: regSearch },
          { email: regSearch },
          { phone: regSearch },
          { profession: regSearch },
          { city: regSearch },
          { state: regSearch },
        ];
      }

      // role filter
      if (role) filters.role = role;

      // isActive filter
      if (isActive == true) {
        filters.isActive = true
      } else if (isActive == false) {
        filters.isActive = false
      }

      // city / state filters
      if (city) filters.city = new RegExp(`^${city}$`, "i");
      if (state) filters.state = new RegExp(`^${state}$`, "i");

      // Sorting
      const sort = {};
      sort[sortField] = sortOrder === "asc" ? 1 : -1;

      // Fetch data
      const data = await UserModel.find(filters)
        .select("-password -reset_link_expiry")
        .skip(skip)
        .limit(pageLimit)
        .sort(sort);

      const total = await UserModel.countDocuments(filters);

      const response = pagingData({
        data,
        total,
        page,
        limit: pageLimit,
      });

      return apiResponse.OK({
        res,
        message: `User ${message.data_get}`,
        data: response,
      });
    } catch (err) {
      console.log(err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong, });
    }
  },

  adminDashboardOverviewCount: async (req, res) => {
    try {
      const [hospitalCount, employeeCount, refundReqCount, refundCompletedCount, completedReqCount, ongoingJobCount, verifiedJobCount, totalRevenue, settings] = await Promise.all([
        // total hospital count
        UserModel.countDocuments({ role: ROLE.HOSPITAL }),
        // total employee count
        UserModel.countDocuments({ role: ROLE.EMPLOYEE }),
        // total refund req count
        JobPostModel.countDocuments({ status: APPLICATION_STATUS.REFUND_REQUEST }),
        // total refund completed req count
        JobPostModel.countDocuments({ status: APPLICATION_STATUS.REFUND_COMPLETED }),
        // total completed req count
        JobPostModel.countDocuments({ status: APPLICATION_STATUS.COMPLETED }),
        // total ongoing req count
        JobPostModel.countDocuments({ status: APPLICATION_STATUS.START_WORKING }),
        // total verified req count
        JobPostModel.countDocuments({ status: APPLICATION_STATUS.VERIFIED }),
        // total revenue
        JobPostModel.aggregate([
          {
            $match: {
              status: APPLICATION_STATUS.VERIFIED
            }
          },
          {
            $group: {
              _id: null,
              totalAdminFee: { $sum: "$adminFee" }
            }
          }
        ]),
        // admin commission percentage
        SettingModel.findOne()
      ])
      const obj = {
        hospitalCount, employeeCount, refundReqCount, refundCompletedCount, completedReqCount, ongoingJobCount, verifiedJobCount, totalRevenue: totalRevenue[0].totalAdminFee, settings
      }

      return apiResponse.OK({ res, message: `Dashboard overview data ${message.data_get}`, data: obj, });
    } catch (err) {
      console.log(err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong, });
    }
  },

};
