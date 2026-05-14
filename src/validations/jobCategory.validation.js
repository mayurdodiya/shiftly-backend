const Joi = require("joi");

// Common ObjectId validation with label
const objectId = (label = "id") =>
  Joi.string().trim().length(24).hex().label(label).messages({
    "string.base": "{#label} must be a string",
    "string.length": "{#label} must be 24 characters long",
    "string.hex": "{#label} must contain only hexadecimal characters",
  });

const addCategory = {
  body: Joi.object({
    categoryName: Joi.string().trim().lowercase().required()
  }).min(1),
};

const addSubCategory = {
  params: Joi.object({
    id: objectId("Category id").required()
  }),
  body: Joi.object({
    subCategoryName: Joi.string().trim().lowercase().required()
  }).min(1),
};

const editCategory = {
  params: Joi.object({
    id: objectId("Category id").required()
  }),
  body: Joi.object({
    categoryName: Joi.string().trim().lowercase().required()
  }).min(1),
};

const editSubCategory = {
  params: Joi.object({
    id: objectId("Sub Category id").required()
  }),
  body: Joi.object({
    subCategoryName: Joi.string().trim().lowercase().required()
  }).min(1),
};

const getAllCategory = {
  query: Joi.object({
    search: Joi.string().trim().optional().allow(null, ""),
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(1000).default(100),
    sortField: Joi.string().valid("createdAt").default("createdAt"),
    sortOrder: Joi.string().valid("asc", "desc").default("desc"),
  }),
};

const getAllSubCategory = {
  params: Joi.object({
    id: objectId("Category id").required()
  }),
  query: Joi.object({
    search: Joi.string().trim().optional().allow(null, ""),
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(1000).default(100),
    sortField: Joi.string().valid("createdAt").default("createdAt"),
    sortOrder: Joi.string().valid("asc", "desc").default("desc"),
  }),
};

module.exports = {
  addCategory,
  addSubCategory,
  editCategory,
  editSubCategory,
  getAllCategory,
  getAllSubCategory,
};
