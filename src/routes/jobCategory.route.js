const express = require("express");
const controller = require("../controllers/jobCategory.controller");
const validate = require("../middlewares/validate");
const { jobCategoryValidation } = require("../validations");
const { auth } = require("../middlewares/auth");
const { ROLE } = require("../utils/constant");
const { upload } = require("../services/s3.upload");
const utils = require("../utils/utils");
const router = express.Router();


// ------------------------------- POST routes -----------------------------------------
// add category
router.post("/", auth({ usersAllowed: [ROLE.ADMIN] }), validate(jobCategoryValidation.addCategory), controller.addCategory);

// add category
router.post("/sub/:id", auth({ usersAllowed: [ROLE.ADMIN] }), validate(jobCategoryValidation.addSubCategory), controller.addSubCategory);

// ------------------------------- PUT routes ------------------------------------------
// edit category
router.put("/:id", auth({ usersAllowed: [ROLE.ADMIN] }), validate(jobCategoryValidation.editCategory), controller.editCategory);

// edit sub category
router.put("/sub/:id", auth({ usersAllowed: [ROLE.ADMIN] }), validate(jobCategoryValidation.editSubCategory), controller.editSubCategory);

// ------------------------------- GET routes ------------------------------------------
// get all category
router.get("/", auth({ usersAllowed: [ROLE.ADMIN, ROLE.EMPLOYEE, ROLE.HOSPITAL] }), validate(jobCategoryValidation.getAllCategory), controller.getAllCategory);

// get all sub category by ctegory id
router.get("/sub/:id", auth({ usersAllowed: [ROLE.ADMIN, ROLE.EMPLOYEE, ROLE.HOSPITAL] }), validate(jobCategoryValidation.getAllSubCategory), controller.getAllSubCategory);

// ------------------------------- DELETE routes ---------------------------------------

module.exports = router;
