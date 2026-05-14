const message = require("../json/message.json");
const { UserModel, JobCategoryModel, JobSubCategoryModel } = require("../models");
const apiResponse = require("../utils/api.response");
const { getPagination, pagingData } = require("../utils/utils");
const { APPLICATION_STATUS, ROLE } = require("../utils/constant");
const dbConfig = require("../config/dbConfig");
const msg91Services = require("../services/sms")


module.exports = {
  addCategory: async (req, res) => {
    try {
      const reqBody = req.body;
      const category = await JobCategoryModel.findOne({ categoryName: reqBody.categoryName, deletedAt: null });

      if (category) return apiResponse.DUPLICATE_VALUE({ res, message: message.category_already_taken });

      const data = await JobCategoryModel.create({ ...reqBody });
      return apiResponse.OK({ res, message: message.category_add_success, data });
    } catch (err) {
      console.log(err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  editCategory: async (req, res) => {
    try {
      const reqBody = req.body;
      const id = req.params.id;

      await JobCategoryModel.findOneAndUpdate({ _id: id, deletedAt: null }, { $set: { ...reqBody } }, { new: true });
      return apiResponse.OK({ res, message: `Category ${message.updated}` });
    } catch (err) {
      console.log(err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  getAllCategory: async (req, res) => {
    try {
      const { search, page, limit = 100, sortField, sortOrder, } = req.query;
      const { skip, limit: pageLimit } = getPagination(page, limit);

      let filters = { deletedAt: null };

      if (search) {
        const regSearch = new RegExp(search, "i");
        filters.$or = [
          { categoryName: regSearch }
        ];
      }

      // Sorting
      const sort = {};
      sort[sortField] = sortOrder === "asc" ? 1 : -1;

      // Fetch data
      const data = await JobCategoryModel.find(filters)
        .skip(skip)
        .limit(pageLimit)
        .sort(sort);

      const total = await JobCategoryModel.countDocuments(filters);

      const response = pagingData({
        data,
        total,
        page,
        limit: pageLimit,
      });

      return apiResponse.OK({
        res,
        message: `Category ${message.data_get}`,
        data: response,
      });
    } catch (err) {
      console.log(err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong, });
    }
  },

  // sub category ----------------------
  addSubCategory: async (req, res) => {
    try {
      const reqBody = req.body;
      const categoryId = req.params.id
      const isExistCat = await JobCategoryModel.findOne({ _id: categoryId })
      if (!isExistCat) return apiResponse.DUPLICATE_VALUE({ res, message: message.category_not_found });

      const subCategory = await JobSubCategoryModel.findOne({ subCategoryName: reqBody.subCategoryName, deletedAt: null });
      if (subCategory) return apiResponse.DUPLICATE_VALUE({ res, message: message.sub_category_already_taken });

      const data = await JobSubCategoryModel.create({ ...reqBody, jobCategoryId: categoryId });
      return apiResponse.OK({ res, message: message.sub_category_add_success, data });
    } catch (err) {
      console.log(err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  editSubCategory: async (req, res) => {
    try {
      const reqBody = req.body;
      const subCategoryId = req.params.id;

      await JobSubCategoryModel.findOneAndUpdate({ _id: subCategoryId, deletedAt: null }, { $set: { ...reqBody } }, { new: true });
      return apiResponse.OK({ res, message: `Sub category ${message.updated}` });
    } catch (err) {
      console.log(err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  getAllSubCategory: async (req, res) => {
    try {
      const { search, page, limit = 100, sortField, sortOrder, } = req.query;
      const categoryId = req.params.id
      const { skip, limit: pageLimit } = getPagination(page, limit);

      let filters = { deletedAt: null, jobCategoryId: categoryId };

      if (search) {
        const regSearch = new RegExp(search, "i");
        filters.$or = [
          { subCategoryName: regSearch }
        ];
      }

      // Sorting
      const sort = {};
      sort[sortField] = sortOrder === "asc" ? 1 : -1;

      // Fetch data
      const data = await JobSubCategoryModel.find(filters)
        .skip(skip)
        .limit(pageLimit)
        .sort(sort);

      const total = await JobSubCategoryModel.countDocuments(filters);

      const response = pagingData({
        data,
        total,
        page,
        limit: pageLimit,
      });

      return apiResponse.OK({
        res,
        message: `Sub category ${message.data_get}`,
        data: response,
      });
    } catch (err) {
      console.log(err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong, });
    }
  },
};
