const express = require("express");
const userController = require("../controllers/user.controller");
const validate = require("../middlewares/validate");
const { userValidation } = require("../validations");
const { auth } = require("../middlewares/auth");
const { ROLE } = require("../utils/constant");
const { upload } = require("../../src/services/s3.upload");
const utils = require("../utils/utils");
const router = express.Router();


// ------------------------------- POST routes -----------------------------------------
// send otp
router.post("/sendOtp", validate(userValidation.sendOtp), userController.sendOtp);

// verify otp
router.post("/verifyOtp", validate(userValidation.verifyOtp), userController.verifyOtp);

// register
router.post("/signup", upload.single("file"), validate(userValidation.register), userController.register);

// upload single 
router.post("/upload", upload.single("file"), utils.uploadImage);


// ------------------------------- PUT routes ------------------------------------------
// edit user
router.put("/edit-profile", auth({ usersAllowed: [ROLE.HOSPITAL, ROLE.EMPLOYEE, ROLE.ADMIN] }), validate(userValidation.editProfile), userController.editProfile);

router.put("/fcm-token", validate(userValidation.updateFcm), userController.updateFcm);

// update commission percentage
router.put("/set-commission-percentage", auth({ usersAllowed: [ROLE.ADMIN] }), validate(userValidation.setCommissionPercentage), userController.setCommissionPercentage);

// ------------------------------- GET routes ------------------------------------------
// get setting details
router.get("/setting", auth({ usersAllowed: [ROLE.HOSPITAL, ROLE.ADMIN] }), userController.getSetting);

// view profile
router.get("/profile", auth({ usersAllowed: [ROLE.HOSPITAL, ROLE.EMPLOYEE, ROLE.ADMIN] }), userController.getProfile);

// get all user (hospital, employee)
router.get("/user-list", auth({ usersAllowed: [ROLE.ADMIN] }), validate(userValidation.getAllUser), userController.getAllUser);

// get dashboard overview count
router.get("/dashboard-overview", /* auth({ usersAllowed: [ROLE.ADMIN] }), */ userController.adminDashboardOverviewCount);

// get user details
// router.get("/:id", /* validate(userValidation.changePassword), */ userController.getUser);


// ------------------------------- DELETE routes ---------------------------------------

module.exports = router;
