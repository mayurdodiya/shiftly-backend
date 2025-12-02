const express = require("express");
const notificationController = require("../controllers/notification.controller");
const validate = require("../middlewares/validate");
const { notificationValidation } = require("../validations");
const { auth } = require("../middlewares/auth");
const { ROLE } = require("../utils/constant");
const router = express.Router();


// ------------------------------- GET routes ------------------------------------------
// get notification count
// router.get("/count",auth({ usersAllowed: [ROLE.HOSPITAL, ROLE.ADMIN] }), notificationController.notificationCount);

// get notification list
router.get("/list", auth({ usersAllowed: [ROLE.HOSPITAL, ROLE.EMPLOYEE] }), validate(notificationValidation.getNotificationsList), notificationController.notificationList);

module.exports = router;
