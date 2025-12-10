const message = require("../json/message.json");
const { JobPostModel, UserModel, SettingModel, JobApplicationModel, NotificationModel } = require("../models");
const apiResponse = require("../utils/api.response");
const mongoose = require("mongoose");
const { Types } = mongoose;
const moment = require("moment");
const { getPagination, pagingData } = require("../utils/utils");
const { APPLICATION_STATUS, ROLE } = require("../utils/constant");
const { sendNotification } = require('./../services/send-noification')


module.exports = {
  // Job post ----------------------------------
  addJobPost: async (req, res) => {
    try {
      const reqBody = req.body;
      const { user } = req;
      reqBody.recruiterId = user._id;

      // create payment using transactionId
      // const payment = await PaymentModel.create({ transactionId:reqBody.transactionId });
      // reqBody.recruiterPaymentId = payment._id

      // Check recruiter exists
      const recruiter = await UserModel.findOne({ _id: reqBody.recruiterId, deletedAt: null, isActive: true });
      if (!recruiter) return apiResponse.NOT_FOUND({ res, message: message.recruiter_not_found });

      // expireAt = 1 hour before midnight from jobStartDate
      const jobStartMidnight = moment(reqBody.jobStartDate).startOf("day");
      reqBody.expireAt = moment(jobStartMidnight).subtract(1, "hour").toDate();

      // Calculate days diff
      const start = new Date(reqBody.jobStartDate);
      const end = new Date(reqBody.jobEndDate);
      const diffTime = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()) - Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());

      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      reqBody.totalDays = diffDays + 1;

      const adminCommission = await SettingModel.findOne({ deletedAt: null });
      reqBody.adminFee = (adminCommission.commission * reqBody.salary) / 100;

      reqBody.employeeSalary = reqBody.salary - (adminCommission.commission * reqBody.salary) / 100;

      const data = await JobPostModel.create({ ...reqBody });

      return apiResponse.OK({ res, message: message.job_post_created, data });
    } catch (err) {
      console.log(err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  getAllJobPost: async (req, res) => {
    try {
      const { isActive, recruiterId, search, status, city, state, minExperience, maxExperience, minSalary, maxSalary, startDate, endDate, page, limit } = req.query;

      const { skip, limit: pageLimit } = getPagination(page, limit);

      let filterArr = [{ deletedAt: null, isActive: true }];

      // Search (title, description, skills)
      if (search) {
        const reg = new RegExp(search, "i");
        filterArr.push({
          $or: [{ title: reg }, { description: reg }, { skills: { $in: [reg] } }, { "location.city": reg }, { "location.state": reg }],
        });
      }

      // Status Filter
      if (status) {
        filterArr.push({ status });
      }

      // isActive Filter
      // if (isActive == true) {
      //   filterArr.push({ isActive: true });
      // } else if (isActive == false) {
      //   filterArr.push({ isActive: false });
      // }

      // Location Filters
      if (recruiterId) filterArr.push({ recruiterId: recruiterId });
      if (city) filterArr.push({ "location.city": city });
      if (state) filterArr.push({ "location.state": state });

      // Experience Filter
      if (minExperience) {
        filterArr.push({ "experience.min": { $gte: Number(minExperience) } });
      }
      if (maxExperience) {
        filterArr.push({ "experience.max": { $lte: Number(maxExperience) } });
      }

      // Salary Filter
      if (minSalary) {
        filterArr.push({ salary: { $gte: Number(minSalary) } });
      }
      if (maxSalary) {
        filterArr.push({ salary: { $lte: Number(maxSalary) } });
      }

      // Date Range Filter
      if (startDate) {
        filterArr.push({
          jobStartDate: { $gte: new Date(startDate) },
        });
      }
      if (endDate) {
        filterArr.push({
          jobStartDate: { $lte: new Date(endDate) },
        });
      }

      const filterQuery = filterArr.length > 0 ? { $and: filterArr } : {};
      const popupate = [
        {
          path: "recruiterId",
          select: "name email phone role",
        },
        {
          path: "hiredApplicantId",
        },
      ]
      const data = await JobPostModel.find(filterQuery).populate(popupate).skip(skip).limit(pageLimit).sort({ createdAt: -1 });

      const totalCount = await JobPostModel.countDocuments(filterQuery);

      const response = pagingData({
        data,
        total: totalCount,
        page,
        limit: pageLimit,
      });

      return apiResponse.OK({ res, message: `Job Post ${message.data_get}`, data: response });
    } catch (err) {
      console.log("Error fetching job posts", err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  getAllJobPostWithApplicantAppliedFlag: async (req, res) => {
    try {
      const { user } = req; // logged-in user (employee)
      const employeeId = user._id;

      const { recruiterId, search, status, city, state, minExperience, maxExperience, minSalary, maxSalary, startDate, endDate, page, limit } = req.query;
      const { skip, limit: pageLimit } = getPagination(page, limit);

      let filterArr = [{ isActive: true }];

      if (search) {
        const reg = new RegExp(search, "i");
        filterArr.push({
          $or: [
            { title: reg },
            { description: reg },
            { skills: reg },
            { "location.city": reg },
            { "location.state": reg }
          ]
        });
      }

      if (status) filterArr.push({ status });
      if (recruiterId) filterArr.push({ recruiterId: new mongoose.Types.ObjectId(recruiterId) });
      if (city) filterArr.push({ "location.city": city });
      if (state) filterArr.push({ "location.state": state });

      if (minExperience) filterArr.push({ "experience.min": { $gte: Number(minExperience) } });
      if (maxExperience) filterArr.push({ "experience.max": { $lte: Number(maxExperience) } });

      if (minSalary) filterArr.push({ salary: { $gte: Number(minSalary) } });
      if (maxSalary) filterArr.push({ salary: { $lte: Number(maxSalary) } });

      if (startDate) filterArr.push({ jobStartDate: { $gte: new Date(startDate) } });
      if (endDate) filterArr.push({ jobStartDate: { $lte: new Date(endDate) } });

      const matchQuery = filterArr.length ? { $and: filterArr } : {};

      const data = await JobPostModel.aggregate([
        { $match: matchQuery },
        {
          $lookup: {
            from: "jobApplication",
            let: { jobId: "$_id", empId: new mongoose.Types.ObjectId(employeeId) },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$jobPostId", "$$jobId"] },
                      { $eq: ["$applicantId", "$$empId"] },
                      { $eq: ["$isActive", true] }
                    ]
                  }
                }
              }
            ],
            as: "appliedData"
          }
        },
        {
          $addFields: {
            isApplied: {
              $cond: [{ $gt: [{ $size: "$appliedData" }, 0] }, true, false]
            }
          }
        },
        {
          $project: {
            appliedData: 0
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "recruiterId",
            foreignField: "_id",
            as: "recruiterId"
          }
        },
        { $unwind: "$recruiterId" },
        {
          $lookup: {
            from: "users",
            localField: "hiredApplicantId",
            foreignField: "_id",
            as: "hiredApplicantId"
          }
        },
        {
          $unwind: {
            path: "$hiredApplicantId",
            preserveNullAndEmptyArrays: true
          }
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: pageLimit }
      ]);

      const totalCount = await JobPostModel.countDocuments(matchQuery);

      const response = pagingData({
        data,
        total: totalCount,
        page,
        limit: pageLimit
      });

      return apiResponse.OK({
        res,
        message: "Job Post Retrieved Successfully",
        data: response
      });

    } catch (err) {
      console.log("Error fetching job posts", err);
      return apiResponse.CATCH_ERROR({
        res,
        message: "Something went wrong"
      });
    }
  },

  // list of applicant applied jobs only for hospital
  getOnlyAppliedJobPosts: async (req, res) => {
    try {
      const { /* recruiterId, */ search, status, city, state, startDate, endDate, page, limit, sortField, sortOrder } = req.query;
      const recruiterId = req.user._id;

      const { skip, limit: pageLimit } = getPagination(page, limit);

      let filterArr = [{ deletedAt: null }, { isActive: true }, { status: APPLICATION_STATUS.PENDING }];

      if (search) {
        const reg = new RegExp(search, "i");
        filterArr.push({
          $or: [
            { title: reg },
            { description: reg },
            { skills: { $in: [reg] } },
            { "location.city": reg },
            { "location.state": reg }
          ]
        });
      }

      if (status) filterArr.push({ status });
      if (recruiterId) filterArr.push({ recruiterId: new Types.ObjectId(recruiterId) });
      if (city) filterArr.push({ "location.city": city });
      if (state) filterArr.push({ "location.state": state });
      if (startDate) filterArr.push({ jobStartDate: { $gte: new Date(startDate) } });
      if (endDate) filterArr.push({ jobStartDate: { $lte: new Date(endDate) } });

      const filterQuery = filterArr.length > 0 ? { $and: filterArr } : {};

      const pipeline = [
        { $match: filterQuery },
        {
          $lookup: {
            from: "jobApplication",
            localField: "_id",
            foreignField: "jobPostId",
            as: "applications"
          }
        },
        { $match: { "applications.0": { $exists: true } } }, // only posts with at least one application
        {
          $addFields: {
            totalApplications: { $size: "$applications" }
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "recruiterId",
            foreignField: "_id",
            as: "recruiter"
          }
        },
        { $unwind: "$recruiter" },
        { $sort: { [sortField || "createdAt"]: sortOrder === "asc" ? 1 : -1 } },
        { $skip: skip },
        { $limit: pageLimit }
      ];

      const data = await JobPostModel.aggregate(pipeline);

      const countPipeline = [
        { $match: filterQuery },
        {
          $lookup: {
            from: "jobApplication",
            localField: "_id",
            foreignField: "jobPostId",
            as: "applications"
          }
        },
        { $match: { "applications.0": { $exists: true } } },
        { $count: "total" }
      ];

      const countResult = await JobPostModel.aggregate(countPipeline);
      const totalCount = countResult.length > 0 ? countResult[0].total : 0;

      const response = pagingData({
        data,
        total: totalCount,
        page,
        limit: pageLimit,
      });

      return apiResponse.OK({
        res,
        message: `Job Posts fetched successfully`,
        data: response,
      })

    } catch (err) {
      console.log("Error fetching job posts", err);
      return apiResponse.CATCH_ERROR({ res, message: "Something went wrong" });
    }
  },

  getJobPostDetail: async (req, res) => {
    try {
      const { id } = req.params;
      const popupate = [
        {
          path: "recruiterId",
        },
        {
          path: "hiredApplicantId",
        },
      ]
      const jobPost = await JobPostModel.findOne({ _id: id, isActive: true }).populate(popupate);

      if (!jobPost) return apiResponse.NOT_FOUND({ res, message: "Job post not found" });

      return apiResponse.OK({
        res,
        message: "Job post details fetched successfully",
        data: jobPost,
      });
    } catch (err) {
      console.log("Error fetching job post", err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  getJobpostOverviewCount: async (req, res) => {
    try {
      const reqBody = req.query
      const query = { isActive: true, deletedAt: null }

      if (reqBody.recruiterId) { query.recruiterId = new Types.ObjectId(reqBody.recruiterId) }
      if (reqBody.applicantId) { query.hiredApplicantId = new Types.ObjectId(reqBody.applicantId) }

      let jobCounts = await JobPostModel.aggregate([
        {
          $match: query
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            k: "$_id",
            v: "$count",
            _id: 0
          }
        },
        {
          $group: {
            _id: null,
            counts: { $push: { k: "$k", v: "$v" } }
          }
        },
        {
          $replaceRoot: {
            newRoot: { $arrayToObject: "$counts" }
          }
        }
      ]);
      jobCounts = jobCounts[0]

      return apiResponse.OK({
        res,
        message: "Job post overview count fetched successfully",
        data: {
          pending: jobCounts.pending ?? 0,
          hired: jobCounts.hired ?? 0,
          start: jobCounts.start ?? 0,
          canceled: jobCounts.canceled ?? 0,
          completed: jobCounts.completed ?? 0,
          verified: jobCounts.verified ?? 0,
          expired: jobCounts.expired ?? 0
        }
      });
    } catch (err) {
      console.log("Error fetching job post", err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  // Apply to job ------------------------------
  applyJob: async (req, res) => {
    try {
      const { jobPostId } = req.body;
      const { user } = req;

      // Check job exists
      const jobPost = await JobPostModel.findOne({ _id: jobPostId, isActive: true }).populate("recruiterId", "_id name fcmToken");
      if (!jobPost) return apiResponse.NOT_FOUND({ res, message: message.job_post_not_found });

      const newStart = new Date(jobPost.jobStartDate);
      const newEnd = new Date(jobPost.jobEndDate);

      // Check overlapping hired jobs
      const overlappingHiredApplication = await JobPostModel.findOne({
        hiredApplicantId: user._id,
        isActive: true,
        status: { $nin: [APPLICATION_STATUS.PENDING] },
        jobStartDate: { $lte: newEnd }, // existing.start <= new.end
        jobEndDate: { $gte: newStart }, // existing.end >= new.start
      });

      if (overlappingHiredApplication) {
        return apiResponse.BAD_REQUEST({ res, message: "You have another hired job in this period, find onther dates jobs.", });
      }

      // Check already applied for same job
      const existingApplication = await JobApplicationModel.findOne({
        jobPostId,
        applicantId: user._id,
        isActive: true,
      });

      if (existingApplication) return apiResponse.BAD_REQUEST({ res, message: message.already_applied_job });

      // Create new application
      const application = await JobApplicationModel.create({ jobPostId, applicantId: user._id });

      // notification
      const title = "New Job Application"
      const msg = `${user.name} applied for the "${jobPost.title}" position.`
      await Promise.all([
        sendNotification(jobPost.recruiterId.fcmToken, title, msg),
        NotificationModel.create({ userId: jobPost.recruiterId._id, title: title, body: msg, })
      ])

      return apiResponse.OK({ res, message: message.job_applied_success, data: application });
    } catch (err) {
      console.log("Error applying to job:", err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  getAllApplications: async (req, res) => {
    try {
      const { applicantId, jobPostId, status, search, minExperience, maxExperience, skill, phone, profession, isActive, startDate, endDate, page, limit, sortField, sortOrder } = req.query;

      const { skip, limit: pageLimit } = getPagination(page, limit);

      let filter = [];

      // filter only active records by default
      // filter.push({ deletedAt: null });

      // Applicant filter
      if (applicantId) {
        filter.push({ applicantId: applicantId });
      }

      // Job Post filter
      if (jobPostId) {
        filter.push({ jobPostId });
      }

      // Status filter
      if (status) {
        filter.push({ status });
      }

      if (isActive == true) {
        filter.push({ isActive: true });
      } else if (isActive == false) {
        filter.push({ isActive: false });
      }

      // Date range filter (application created date)
      if (startDate) {
        filter.push({ createdAt: { $gte: new Date(startDate) } });
      }
      if (endDate) {
        filter.push({ createdAt: { $lte: new Date(endDate) } });
      }

      // Search text filter (name, phone, job title)
      if (search) {
        const reg = new RegExp(search, "i");
        filter.push({
          $or: [{ "applicant.name": reg }, { "applicant.phone": reg }, { "jobPost.title": reg }, { "jobPost.skills": { $in: [reg] } }],
        });
      }

      // Skill filter
      if (skill) {
        filter.push({ "applicant.skill": { $in: [skill] } });
      }

      // Phone filter
      if (phone) {
        filter.push({ "applicant.phone": phone });
      }

      // Profession filter
      if (profession) {
        filter.push({ "applicant.profession": profession });
      }

      // Experience filter
      if (minExperience) {
        filter.push({ "applicant.experience": { $gte: Number(minExperience) } });
      }
      if (maxExperience) {
        filter.push({ "applicant.experience": { $lte: Number(maxExperience) } });
      }

      const finalQuery = filter.length ? { $and: filter } : {};

      // === Populate with applicant + jobPost ===
      const data = await JobApplicationModel.find(finalQuery)
        .populate("applicantId", "name phone profession skill experience resumeUrl")
        .populate("jobPostId", "title skills salary experience location")
        .skip(skip)
        .limit(pageLimit)
        .sort({ [sortField]: sortOrder === "asc" ? 1 : -1 });

      const totalCount = await JobApplicationModel.countDocuments(finalQuery);

      const response = pagingData({
        data,
        total: totalCount,
        page,
        limit: pageLimit,
      });

      return apiResponse.OK({
        res,
        message: "Job Applications fetched successfully",
        data: response,
      });
    } catch (err) {
      console.log("Error fetching applications :", err);
      return apiResponse.CATCH_ERROR({
        res,
        message: "Something went wrong",
      });
    }
  },

  getAllMyAppliedJobApplicationOLD: async (req, res) => {
    try {
      const { jobPostId, search, minExperience, maxExperience, skill, phone, profession, isActive, startDate, endDate, page, limit, sortField, sortOrder } = req.query;
      const applicantId = req.user._id;

      const { skip, limit: pageLimit } = getPagination(page, limit);

      let filter = [];

      // Applicant filter
      if (applicantId) {
        filter.push({ applicantId: applicantId });
      }

      // Job Post filter
      if (jobPostId) {
        filter.push({ jobPostId });
      }

      if (isActive == true) {
        filter.push({ isActive: true });
      } else if (isActive == false) {
        filter.push({ isActive: false });
      }

      // Date range filter (application created date)
      if (startDate) {
        filter.push({ createdAt: { $gte: new Date(startDate) } });
      }
      if (endDate) {
        filter.push({ createdAt: { $lte: new Date(endDate) } });
      }

      // Search text filter (name, phone, job title)
      if (search) {
        const reg = new RegExp(search, "i");
        filter.push({
          $or: [{ "applicant.name": reg }, { "applicant.phone": reg }, { "jobPost.title": reg }, { "jobPost.skills": { $in: [reg] } }],
        });
      }

      // Skill filter
      if (skill) {
        filter.push({ "applicant.skill": { $in: [skill] } });
      }

      // Phone filter
      if (phone) {
        filter.push({ "applicant.phone": phone });
      }

      // Profession filter
      if (profession) {
        filter.push({ "applicant.profession": profession });
      }

      // Experience filter
      if (minExperience) {
        filter.push({ "applicant.experience": { $gte: Number(minExperience) } });
      }
      if (maxExperience) {
        filter.push({ "applicant.experience": { $lte: Number(maxExperience) } });
      }

      const finalQuery = filter.length ? { $and: filter } : {};

      const data = await JobApplicationModel.aggregate([
        { $match: finalQuery },

        // Join jobPost
        {
          $lookup: {
            from: "jobPost",
            localField: "jobPostId",
            foreignField: "_id",
            as: "jobPost",
          }
        },

        // Unwind result
        { $unwind: "$jobPost" },

        // Filter only pending jobPosts
        {
          $match: {
            "jobPost.status": APPLICATION_STATUS.PENDING
          }
        },

        // Populate applicantId
        {
          $lookup: {
            from: "users",
            localField: "applicantId",
            foreignField: "_id",
            as: "applicant"
          }
        },
        { $unwind: "$applicant" },

        // Fields selection
        {
          $project: {
            jobPost: 1,
            applicant: {
              name: 1,
              phone: 1,
              profession: 1,
              skill: 1,
              experience: 1,
              resumeUrl: 1,
            },
            isActive: 1,
            createdAt: 1
          }
        },

        // Sorting
        { $sort: { [sortField]: sortOrder === "asc" ? 1 : -1 } },

        // Pagination
        { $skip: skip },
        { $limit: pageLimit }
      ]);

      const totalCount = await JobApplicationModel.countDocuments(finalQuery);

      const response = pagingData({
        data,
        total: totalCount,
        page,
        limit: pageLimit,
      });

      return apiResponse.OK({
        res,
        message: "Job Applications fetched successfully",
        data: response,
      });
    } catch (err) {
      console.log("Error fetching applications :", err);
      return apiResponse.CATCH_ERROR({
        res,
        message: "Something went wrong",
      });
    }
  },
  getAllMyAppliedJobApplication: async (req, res) => {
    try {
      const { jobPostId, search, minExperience, maxExperience, skill, phone, profession, isActive, startDate, endDate, page, limit, sortField, sortOrder } = req.query;
      const applicantId = req.user._id;

      const { skip, limit: pageLimit } = getPagination(page, limit);

      let filter = [];

      // Applicant filter
      if (applicantId) {
        filter.push({ applicantId: applicantId });
      }

      // Job Post filter
      if (jobPostId) {
        filter.push({ jobPostId });
      }

      filter.push({ isActive: true });
      // if (isActive == true) {
      // } else if (isActive == false) {
      //   filter.push({ isActive: false });
      // }

      // Date range filter (application created date)
      if (startDate) {
        filter.push({ createdAt: { $gte: new Date(startDate) } });
      }
      if (endDate) {
        filter.push({ createdAt: { $lte: new Date(endDate) } });
      }

      // Search text filter (name, phone, job title)
      if (search) {
        const reg = new RegExp(search, "i");
        filter.push({
          $or: [{ "applicant.name": reg }, { "applicant.phone": reg }, { "jobPost.title": reg }, { "jobPost.skills": { $in: [reg] } }],
        });
      }

      // Skill filter
      if (skill) {
        filter.push({ "applicant.skill": { $in: [skill] } });
      }

      // Phone filter
      if (phone) {
        filter.push({ "applicant.phone": phone });
      }

      // Profession filter
      if (profession) {
        filter.push({ "applicant.profession": profession });
      }

      // Experience filter
      if (minExperience) {
        filter.push({ "applicant.experience": { $gte: Number(minExperience) } });
      }
      if (maxExperience) {
        filter.push({ "applicant.experience": { $lte: Number(maxExperience) } });
      }

      const finalQuery = filter.length ? { $and: filter } : {};

      const data = await JobApplicationModel.aggregate([
        { $match: finalQuery },

        // Join jobPost
        {
          $lookup: {
            from: "jobPost",
            localField: "jobPostId",
            foreignField: "_id",
            as: "jobPost",
            pipeline: [
              {
                $lookup: {
                  from: "users",
                  localField: "recruiterId",
                  foreignField: "_id",
                  as: "recruiterId"
                }
              },
              {
                $unwind: "$recruiterId"
              }
            ]
          }
        },
        { $unwind: "$jobPost" },

        // Filter only pending jobPosts
        {
          $match: {
            "jobPost.status": APPLICATION_STATUS.PENDING
          }
        },

        // Populate applicant
        {
          $lookup: {
            from: "users",
            localField: "applicantId",
            foreignField: "_id",
            as: "applicant"
          }
        },
        { $unwind: "$applicant" },

        // Flatten jobPost fields
        {
          $addFields: {
            recruiterId: "$jobPost.recruiterId",
            title: "$jobPost.title",
            description: "$jobPost.description",
            skills: "$jobPost.skills",
            experience: "$jobPost.experience",
            location: "$jobPost.location",
            salary: "$jobPost.salary",
            adminFee: "$jobPost.adminFee",
            employeeSalary: "$jobPost.employeeSalary",
            shiftStartTime: "$jobPost.shiftStartTime",
            shiftEndTime: "$jobPost.shiftEndTime",
            jobStartDate: "$jobPost.jobStartDate",
            jobEndDate: "$jobPost.jobEndDate",
            totalDays: "$jobPost.totalDays",
            hiredApplicantId: "$jobPost.hiredApplicantId",
            status: "$jobPost.status",
            recruiterPaymentId: "$jobPost.recruiterPaymentId",
            recruiterRefundPaymentId: "$jobPost.recruiterRefundPaymentId",
            employeePaymentId: "$jobPost.employeePaymentId",
            paymentStatus: "$jobPost.paymentStatus",
            expireAt: "$jobPost.expireAt",
            jobPostCreatedAt: "$jobPost.createdAt",
            jobPostUpdatedAt: "$jobPost.updatedAt"
          }
        },

        // Select fields
        {
          $project: {
            // jobPost: 0, // remove nested jobPost
            applicant: {
              name: 1,
              phone: 1,
              profession: 1,
              skill: 1,
              experience: 1,
              resumeUrl: 1,
            },
            isActive: 1,
            createdAt: 1,
            recruiterId: 1,
            title: 1,
            description: 1,
            skills: 1,
            experience: 1,
            location: 1,
            salary: 1,
            adminFee: 1,
            employeeSalary: 1,
            shiftStartTime: 1,
            shiftEndTime: 1,
            jobStartDate: 1,
            jobEndDate: 1,
            totalDays: 1,
            hiredApplicantId: 1,
            status: 1,
            recruiterPaymentId: 1,
            recruiterRefundPaymentId: 1,
            employeePaymentId: 1,
            paymentStatus: 1,
            expireAt: 1,
            jobPostCreatedAt: 1,
            jobPostUpdatedAt: 1
          }
        },

        // Sorting
        { $sort: { [sortField]: sortOrder === "asc" ? 1 : -1 } },

        // Pagination
        { $skip: skip },
        { $limit: pageLimit }
      ]);

      // ============================
      // GET TOTAL COUNT (REAL COUNT)
      // ============================
      const totalResult = await JobApplicationModel.aggregate([
        { $match: finalQuery },

        {
          $lookup: {
            from: "jobPost",
            localField: "jobPostId",
            foreignField: "_id",
            as: "jobPost",
          }
        },
        { $unwind: "$jobPost" },

        {
          $match: {
            "jobPost.status": APPLICATION_STATUS.PENDING
          }
        },

        {
          $lookup: {
            from: "users",
            localField: "applicantId",
            foreignField: "_id",
            as: "applicant"
          }
        },
        { $unwind: "$applicant" },

        { $count: "totalRecords" }
      ]);

      const totalCount = totalResult.length ? totalResult[0].totalRecords : 0;

      const response = pagingData({
        data,
        total: totalCount,
        page,
        limit: pageLimit,
      });

      return apiResponse.OK({
        res,
        message: "Job Applications fetched successfully",
        data: response,
      });
    } catch (err) {
      console.log("Error fetching applications :", err);
      return apiResponse.CATCH_ERROR({
        res,
        message: "Something went wrong",
      });
    }
  },

  // view all upcoming jobs for hospital and employee
  viewAllUpcomingJobs: async (req, res) => {
    try {
      const { applicantId, recruiterId, search, city, state, startDate, endDate, page, limit } = req.query;

      const { skip, limit: pageLimit } = getPagination(page, limit);

      let filterArr = [{ deletedAt: null, isActive: true, status: APPLICATION_STATUS.HIRED }];

      // Search (title, description, skills)
      if (search) {
        const reg = new RegExp(search, "i");
        filterArr.push({
          $or: [{ title: reg }, { description: reg }, { skills: { $in: [reg] } }, { "location.city": reg }, { "location.state": reg }],
        });
      }

      if (applicantId) {
        filterArr.push({ hiredApplicantId: applicantId });
      }

      if (recruiterId) {
        filterArr.push({ recruiterId: recruiterId });
      }

      // Location Filters
      if (city) filterArr.push({ "location.city": city });
      if (state) filterArr.push({ "location.state": state });

      // Date Range Filter
      if (startDate) {
        filterArr.push({
          jobStartDate: { $gte: new Date(startDate) },
        });
      }
      if (endDate) {
        filterArr.push({
          jobStartDate: { $lte: new Date(endDate) },
        });
      }

      const filterQuery = filterArr.length > 0 ? { $and: filterArr } : {};
      const popupate = [
        {
          path: "recruiterId",
          select: "name email phone role",
        },
        {
          path: "hiredApplicantId",
        },
      ]
      // const data = await JobPostModel.find(filterQuery).populate("recruiterId", "name email phone role").skip(skip).limit(pageLimit).sort({ jobStartDate: -1 });
      const data = await JobPostModel.find(filterQuery).populate(popupate).skip(skip).limit(pageLimit).sort({ jobStartDate: -1 });

      const totalCount = await JobPostModel.countDocuments(filterQuery);

      const response = pagingData({
        data,
        total: totalCount,
        page,
        limit: pageLimit,
      });

      return apiResponse.OK({ res, message: `Job Post ${message.data_get} `, data: response });
    } catch (err) {
      console.log("Error fetching job posts", err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  // view all ongoing(start) jobs for hospital and employee
  viewAllOngoingJobs: async (req, res) => {
    try {
      const { applicantId, recruiterId, search, city, state, startDate, endDate, page, limit } = req.query;

      const { skip, limit: pageLimit } = getPagination(page, limit);

      let filterArr = [{ deletedAt: null, isActive: true, status: APPLICATION_STATUS.START_WORKING }];

      // Search (title, description, skills)
      if (search) {
        const reg = new RegExp(search, "i");
        filterArr.push({
          $or: [{ title: reg }, { description: reg }, { skills: { $in: [reg] } }, { "location.city": reg }, { "location.state": reg }],
        });
      }

      if (applicantId) {
        filterArr.push({ hiredApplicantId: applicantId });
      }

      if (recruiterId) {
        filterArr.push({ recruiterId: recruiterId });
      }

      // Location Filters
      if (city) filterArr.push({ "location.city": city });
      if (state) filterArr.push({ "location.state": state });

      // Date Range Filter
      if (startDate) {
        filterArr.push({
          jobStartDate: { $gte: new Date(startDate) },
        });
      }
      if (endDate) {
        filterArr.push({
          jobStartDate: { $lte: new Date(endDate) },
        });
      }

      const filterQuery = filterArr.length > 0 ? { $and: filterArr } : {};
      const popupate = [
        {
          path: "recruiterId",
          select: "name email phone role",
        },
        {
          path: "hiredApplicantId",
        },
      ]
      // const data = await JobPostModel.find(filterQuery).populate("recruiterId", "name email phone role").skip(skip).limit(pageLimit).sort({ jobStartDate: -1 });
      const data = await JobPostModel.find(filterQuery).populate(popupate).skip(skip).limit(pageLimit).sort({ jobStartDate: -1 });

      const totalCount = await JobPostModel.countDocuments(filterQuery);

      const response = pagingData({
        data,
        total: totalCount,
        page,
        limit: pageLimit,
      });

      return apiResponse.OK({ res, message: `Job Post ${message.data_get} `, data: response });
    } catch (err) {
      console.log("Error fetching job posts", err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  // view all completed jobs for hospital and employee
  viewAllCompletedJobs: async (req, res) => {
    try {
      const { applicantId, recruiterId, search, city, state, startDate, endDate, page, limit } = req.query;

      const { skip, limit: pageLimit } = getPagination(page, limit);

      let filterArr = [{ deletedAt: null, isActive: true, status: APPLICATION_STATUS.COMPLETED }];

      // Search (title, description, skills)
      if (search) {
        const reg = new RegExp(search, "i");
        filterArr.push({
          $or: [{ title: reg }, { description: reg }, { skills: { $in: [reg] } }, { "location.city": reg }, { "location.state": reg }],
        });
      }

      if (applicantId) filterArr.push({ hiredApplicantId: applicantId });
      if (recruiterId) filterArr.push({ recruiterId: recruiterId });

      // Location Filters
      if (city) filterArr.push({ "location.city": city });
      if (state) filterArr.push({ "location.state": state });

      // Date Range Filter
      if (startDate) {
        filterArr.push({
          jobStartDate: { $gte: new Date(startDate) },
        });
      }
      if (endDate) {
        filterArr.push({
          jobStartDate: { $lte: new Date(endDate) },
        });
      }

      const filterQuery = filterArr.length > 0 ? { $and: filterArr } : {};
      const popupate = [
        {
          path: "recruiterId",
          select: "name email phone role",
        },
        {
          path: "hiredApplicantId",
        },
      ]
      // const data = await JobPostModel.find(filterQuery).populate("recruiterId", "name email phone role").skip(skip).limit(pageLimit).sort({ jobStartDate: -1 });
      const data = await JobPostModel.find(filterQuery).populate(popupate).skip(skip).limit(pageLimit).sort({ jobStartDate: -1 });
      const totalCount = await JobPostModel.countDocuments(filterQuery);

      const response = pagingData({
        data,
        total: totalCount,
        page,
        limit: pageLimit,
      });

      return apiResponse.OK({ res, message: `Job Post ${message.data_get} `, data: response });
    } catch (err) {
      console.log("Error fetching job posts", err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  // view all verified jobs for hospital and employee
  viewAllVerifiedJobs: async (req, res) => {
    try {
      const { applicantId, recruiterId, search, city, state, startDate, endDate, page, limit } = req.query;

      const { skip, limit: pageLimit } = getPagination(page, limit);

      let filterArr = [{ deletedAt: null, isActive: true, status: APPLICATION_STATUS.VERIFIED }];

      // Search (title, description, skills)
      if (search) {
        const reg = new RegExp(search, "i");
        filterArr.push({
          $or: [{ title: reg }, { description: reg }, { skills: { $in: [reg] } }, { "location.city": reg }, { "location.state": reg }],
        });
      }

      if (applicantId) filterArr.push({ hiredApplicantId: applicantId });
      if (recruiterId) filterArr.push({ recruiterId: recruiterId });

      // Location Filters
      if (city) filterArr.push({ "location.city": city });
      if (state) filterArr.push({ "location.state": state });

      // Date Range Filter
      if (startDate) {
        filterArr.push({
          jobStartDate: { $gte: new Date(startDate) },
        });
      }
      if (endDate) {
        filterArr.push({
          jobStartDate: { $lte: new Date(endDate) },
        });
      }

      const filterQuery = filterArr.length > 0 ? { $and: filterArr } : {};
      const popupate = [
        {
          path: "recruiterId",
          select: "name email phone role",
        },
        {
          path: "hiredApplicantId",
        },
      ]
      // const data = await JobPostModel.find(filterQuery).populate("recruiterId", "name email phone role").skip(skip).limit(pageLimit).sort({ jobStartDate: -1 });
      const data = await JobPostModel.find(filterQuery).populate(popupate).skip(skip).limit(pageLimit).sort({ jobStartDate: -1 });
      const totalCount = await JobPostModel.countDocuments(filterQuery);

      const response = pagingData({
        data,
        total: totalCount,
        page,
        limit: pageLimit,
      });

      return apiResponse.OK({ res, message: `Job Post ${message.data_get} `, data: response });
    } catch (err) {
      console.log("Error fetching job posts", err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  // view all expried jobs for hospital
  viewAllExpriedJobs: async (req, res) => {
    try {
      const { applicantId, recruiterId, search, city, state, startDate, endDate, page, limit } = req.query;

      const { skip, limit: pageLimit } = getPagination(page, limit);

      // let filterArr = [{ deletedAt: null, isActive: true, status: APPLICATION_STATUS.EXPIRED }];
      let filterArr = [
        { deletedAt: null, isActive: true },
        // status: APPLICATION_STATUS.PENDING,
        {
          $or: [
            { status: APPLICATION_STATUS.REFUND_REQUEST },
            { status: APPLICATION_STATUS.REFUND_COMPLETED },
            { status: APPLICATION_STATUS.PENDING },
          ]
        },
        { expireAt: { $lte: new Date() } }
      ];

      // Search (title, description, skills)
      if (search) {
        const reg = new RegExp(search, "i");
        filterArr.push({
          $or: [{ title: reg }, { description: reg }, { skills: { $in: [reg] } }, { "location.city": reg }, { "location.state": reg }],
        });
      }

      if (applicantId) filterArr.push({ hiredApplicantId: applicantId });
      if (recruiterId) filterArr.push({ recruiterId: recruiterId });

      // Location Filters
      if (city) filterArr.push({ "location.city": city });
      if (state) filterArr.push({ "location.state": state });

      // Date Range Filter
      if (startDate) {
        filterArr.push({
          jobStartDate: { $gte: new Date(startDate) },
        });
      }
      if (endDate) {
        filterArr.push({
          jobStartDate: { $lte: new Date(endDate) },
        });
      }

      const filterQuery = filterArr.length > 0 ? { $and: filterArr } : {};
      const popupate = [
        {
          path: "recruiterId",
          select: "name email phone role",
        },
        {
          path: "hiredApplicantId",
        },
      ]
      // const data = await JobPostModel.find(filterQuery).populate("recruiterId", "name email phone role").skip(skip).limit(pageLimit).sort({ jobStartDate: -1 });
      const data = await JobPostModel.find(filterQuery).populate(popupate).skip(skip).limit(pageLimit).sort({ jobStartDate: -1 });
      const totalCount = await JobPostModel.countDocuments(filterQuery);

      const response = pagingData({
        data,
        total: totalCount,
        page,
        limit: pageLimit,
      });

      return apiResponse.OK({ res, message: `Job Post ${message.data_get} `, data: response });
    } catch (err) {
      console.log("Error fetching job posts", err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  // view all refund request for hospital and admin
  viewAllRefundRequest: async (req, res) => {
    try {
      const { recruiterId, search, city, state, startDate, endDate, page, limit } = req.query;

      const { skip, limit: pageLimit } = getPagination(page, limit);

      let filterArr = [{ deletedAt: null, isActive: true, status: APPLICATION_STATUS.REFUND_REQUEST }];

      // Search (title, description, skills)
      if (search) {
        const reg = new RegExp(search, "i");
        filterArr.push({
          $or: [{ title: reg }, { "location.city": reg }, { "location.state": reg }],
        });
      }

      if (recruiterId) filterArr.push({ recruiterId: recruiterId });

      // Location Filters
      if (city) filterArr.push({ "location.city": city });
      if (state) filterArr.push({ "location.state": state });

      // Date Range Filter
      if (startDate) {
        filterArr.push({
          jobStartDate: { $gte: new Date(startDate) },
        });
      }
      if (endDate) {
        filterArr.push({
          jobStartDate: { $lte: new Date(endDate) },
        });
      }

      const filterQuery = filterArr.length > 0 ? { $and: filterArr } : {};
      const popupate = [
        {
          path: "recruiterId",
          select: "name email phone role",
        },
        {
          path: "hiredApplicantId",
        },
      ]
      // const data = await JobPostModel.find(filterQuery).populate("recruiterId", "name email phone role").skip(skip).limit(pageLimit).sort({ jobStartDate: -1 });
      const data = await JobPostModel.find(filterQuery).populate(popupate).skip(skip).limit(pageLimit).sort({ jobStartDate: -1 });
      const totalCount = await JobPostModel.countDocuments(filterQuery);

      const response = pagingData({
        data,
        total: totalCount,
        page,
        limit: pageLimit,
      });

      return apiResponse.OK({ res, message: `Job Post ${message.data_get} `, data: response });
    } catch (err) {
      console.log("Error fetching job posts", err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  // view all refund completed jobs for hospital and admin
  viewAllRefundCompletedRequest: async (req, res) => {
    try {
      const { recruiterId, search, city, state, startDate, endDate, page, limit } = req.query;

      const { skip, limit: pageLimit } = getPagination(page, limit);

      let filterArr = [{ deletedAt: null, isActive: true, status: APPLICATION_STATUS.REFUND_COMPLETED }];

      // Search (title, description, skills)
      if (search) {
        const reg = new RegExp(search, "i");
        filterArr.push({
          $or: [{ title: reg }, { "location.city": reg }, { "location.state": reg }],
        });
      }

      if (recruiterId) filterArr.push({ recruiterId: recruiterId });

      // Location Filters
      if (city) filterArr.push({ "location.city": city });
      if (state) filterArr.push({ "location.state": state });

      // Date Range Filter
      if (startDate) {
        filterArr.push({
          jobStartDate: { $gte: new Date(startDate) },
        });
      }
      if (endDate) {
        filterArr.push({
          jobStartDate: { $lte: new Date(endDate) },
        });
      }

      const filterQuery = filterArr.length > 0 ? { $and: filterArr } : {};
      const popupate = [
        {
          path: "recruiterId",
          select: "name email phone role",
        },
        {
          path: "hiredApplicantId",
        },
      ]
      // const data = await JobPostModel.find(filterQuery).populate("recruiterId", "name email phone role").skip(skip).limit(pageLimit).sort({ jobStartDate: -1 });
      const data = await JobPostModel.find(filterQuery).populate(popupate).skip(skip).limit(pageLimit).sort({ jobStartDate: -1 });
      const totalCount = await JobPostModel.countDocuments(filterQuery);

      const response = pagingData({
        data,
        total: totalCount,
        page,
        limit: pageLimit,
      });

      return apiResponse.OK({ res, message: `Job Post ${message.data_get} `, data: response });
    } catch (err) {
      console.log("Error fetching job posts", err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  // get job post all status overview count (ongoing, upcoming, completed, expired, verified)
  jobpostStatusOverviewCount: async (req, res) => {
    try {
      const { applicantId, recruiterId } = req.query;

      let filterArr = [{ deletedAt: null, isActive: true }];
      if (applicantId) filterArr.push({ hiredApplicantId: applicantId });
      if (recruiterId) filterArr.push({ recruiterId: recruiterId });

      const filterQuery = filterArr.length > 0 ? { $and: filterArr } : {};

      const [pending, hired, start, canceled, completed, verified, expired] = await Promise.all([
        // pending
        JobPostModel.countDocuments({ ...filterQuery, status: APPLICATION_STATUS.PENDING }),
        // hired
        JobPostModel.countDocuments({ ...filterQuery, status: APPLICATION_STATUS.HIRED }),
        // start
        JobPostModel.countDocuments({ ...filterQuery, status: APPLICATION_STATUS.START_WORKING }),
        // canceled
        JobPostModel.countDocuments({ ...filterQuery, status: APPLICATION_STATUS.CANCELED }),
        // completed
        JobPostModel.countDocuments({ ...filterQuery, status: APPLICATION_STATUS.COMPLETED }),
        // verified
        JobPostModel.countDocuments({ ...filterQuery, status: APPLICATION_STATUS.VERIFIED }),
        // expired
        JobPostModel.countDocuments({ ...filterQuery, status: APPLICATION_STATUS.PENDING, expireAt: { $lte: new Date() } })
      ])

      const response = {
        pending,
        hired,
        start,
        canceled,
        completed,
        verified,
        expired
      }

      return apiResponse.OK({ res, message: `Job Post status overview count data ${message.data_get}`, data: response });
    } catch (err) {
      console.log("Error fetching job posts", err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  // change job post status i'am arrived (start job) (only for employee)
  startJobByEmployee: async (req, res) => {
    try {
      const id = req.params.jobPostId;
      const { user } = req;

      const job = await JobPostModel.findOne({ _id: id }).populate("recruiterId", "_id name fcmToken").lean();
      if (!job) return apiResponse.NOT_FOUND({ res, message: message.job_post_not_found });
      if (job.hiredApplicantId != user._id.toString()) return apiResponse.UNAUTHORIZED({ res, message: message.you_not_hired_for_job });
      if (job.status == APPLICATION_STATUS.START_WORKING) return apiResponse.VALIDATION_ERROR({ res, message: message.already_start_job });

      await JobPostModel.findOneAndUpdate({ _id: id }, { status: APPLICATION_STATUS.START_WORKING });

      // notification
      const title = "Applicant Arriving Soon"
      const msg = `${user.name} will arrive at your hospital in a few minutes.`
      await Promise.all([
        sendNotification(job.recruiterId.fcmToken, title, msg),
        NotificationModel.create({ userId: job.recruiterId._id, title: title, body: msg, })
      ])

      return apiResponse.OK({ res, message: message.application_status_updated });
    } catch (err) {
      console.log("Error fetching job posts", err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  // change job post status i'am completed my duty (only for employee)
  completeJobByEmployee: async (req, res) => {
    try {
      const id = req.params.jobPostId;
      const { user } = req;

      const job = await JobPostModel.findOne({ _id: id }).populate("recruiterId", "_id name fcmToken").lean();
      if (!job) return apiResponse.NOT_FOUND({ res, message: message.job_post_not_found });
      if (job.hiredApplicantId != user._id.toString()) return apiResponse.UNAUTHORIZED({ res, message: message.you_not_hired_for_job });
      if (job.status == APPLICATION_STATUS.COMPLETED) return apiResponse.VALIDATION_ERROR({ res, message: message.already_completed_job });
      if (job.status !== APPLICATION_STATUS.START_WORKING) return apiResponse.VALIDATION_ERROR({ res, message: message.job_not_start });

      await JobPostModel.findOneAndUpdate({ _id: id }, { status: APPLICATION_STATUS.COMPLETED });

      // notification
      const title = "Shift Completed"
      const msg = `${user.name} has completed their duty at your hospital.`

      await Promise.all([
        sendNotification(job.recruiterId.fcmToken, title, msg),
        NotificationModel.create({ userId: job.recruiterId._id, title: title, body: msg, })
      ])

      return apiResponse.OK({ res, message: message.application_status_updated });
    } catch (err) {
      console.log("Error fetching job posts", err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  // change job post status as verified (only for hospital user)
  verifiedJobByHospital: async (req, res) => {
    try {
      const id = req.params.jobPostId;
      const { user } = req;

      const job = await JobPostModel.findOne({ _id: id, recruiterId: user._id }).populate("hiredApplicantId", "_id name fcmToken").lean();

      if (!job) return apiResponse.NOT_FOUND({ res, message: message.job_post_not_found });
      if (job.status == APPLICATION_STATUS.VERIFIED) return apiResponse.VALIDATION_ERROR({ res, message: message.already_verified_job });
      if (job.status !== APPLICATION_STATUS.COMPLETED) return apiResponse.VALIDATION_ERROR({ res, message: message.pending_job_completion });

      await JobPostModel.findOneAndUpdate({ _id: id }, { status: APPLICATION_STATUS.VERIFIED });

      // notification
      const title = "Work Approved"
      const msg = `Your work has been verified by ${user.name}.`
      await Promise.all([
        sendNotification(job.hiredApplicantId.fcmToken, title, msg),
        NotificationModel.create({ userId: job.recruiterId._id, title: title, body: msg, })
      ])

      return apiResponse.OK({ res, message: message.application_status_updated });
    } catch (err) {
      console.log("Error fetching job posts", err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  getApplicationDetail: async (req, res) => {
    try {
      const { id } = req.params;
      const data = await JobApplicationModel.findById(id).populate("applicantId", "name phone profession skill experience resumeUrl").populate("jobPostId", "title description skills salary experience location");

      if (!data) {
        return apiResponse.NOT_FOUND({
          res,
          message: "Application not found",
        });
      }

      return apiResponse.OK({
        res,
        message: "Application detail fetched successfully",
        data,
      });
    } catch (err) {
      console.log("Error fetching application detail:", err);
      return apiResponse.CATCH_ERROR({
        res,
        message: "Something went wrong",
      });
    }
  },

  addJobPostPayment: async (req, res) => {
    try {
      const { jobPostId } = req.body;
      const { user } = req;

      // Check job exists and active
      const jobPost = await JobPostModel.findOne({ _id: jobPostId, isActive: false });
      if (!jobPost) return apiResponse.NOT_FOUND({ res, message: message.job_post_not_found });

      await JobPostModel.findOneAndUpdate({ _id: jobPostId }, { isActive: true });

      // job post payment status change
      // add payment id in job post

      return apiResponse.OK({ res, message: message.payment_success });
    } catch (err) {
      console.log("Error applying to job:", err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  hireApplicant: async (req, res) => {
    try {
      const applicationId = req.params.applicationId;
      const { user } = req;

      // Check if application exists and active
      const application = await JobApplicationModel.findOne({ _id: applicationId, isActive: true }).populate("applicantId");

      if (!application) return apiResponse.NOT_FOUND({ res, message: message.application_not_found });

      // check already hired or not
      const isExist = await JobPostModel.findOne({ _id: application.jobPostId._id, status: APPLICATION_STATUS.HIRED });
      if (isExist) return apiResponse.NOT_FOUND({ res, message: message.applicant_hired_already });

      // change jobpost status
      await JobPostModel.findOneAndUpdate({ _id: application.jobPostId._id }, { status: APPLICATION_STATUS.HIRED, hiredApplicantId: application.applicantId });

      // notification
      const title = "Appointment Confirmed"
      const msg = `Your work has been verified by ${user.name}.`

      await Promise.all([
        sendNotification(application.applicantId.fcmToken, title, msg),
        NotificationModel.create({ userId: user._id, title: title, body: msg, })
      ])

      return apiResponse.OK({ res, message: message.application_status_updated, data: application });
    } catch (err) {
      console.log("Error updating application status:", err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  // only for hospital user 
  requestForRefund: async (req, res) => {
    try {
      const { jobPostId } = req.params;
      const { user } = req;

      // Check job exists
      const jobPost = await JobPostModel.findOne({ _id: jobPostId, isActive: true }).populate("recruiterId", "_id name fcmToken");
      if (!jobPost) return apiResponse.NOT_FOUND({ res, message: message.job_post_not_found });
      if (jobPost.status === APPLICATION_STATUS.REFUND_REQUEST) return apiResponse.BAD_REQUEST({ res, message: message.refund_request_already_sent })

      if (jobPost.status === APPLICATION_STATUS.PENDING && jobPost.expireAt < new Date()) {
        await JobPostModel.findByIdAndUpdate(jobPostId, { status: APPLICATION_STATUS.REFUND_REQUEST });

        // notification
        const title = "New refund request"
        const msg = `${user.name} has requested a refund for ${jobPost.title}, request id is ${jobPost._id}.`
        const admin = await UserModel.findOne({ role: ROLE.ADMIN }).lean()
        await Promise.all([
          // admin have no fcm token sendNotification(jobPost.recruiterId.fcmToken, title, msg),
          NotificationModel.create({ userId: admin._id, title: title, body: msg, })
        ])

        return apiResponse.OK({ res, message: `${message.refund_request_sent}, request id is ${jobPost._id}.` });
      } else {
        return apiResponse.BAD_REQUEST({ res, message: message.refund_req_after_expire });
      }

    } catch (err) {
      console.log("Error requestForRefund to job:", err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  sendRefundToHospital: async (req, res) => {
    try {
      const { jobPostId } = req.params;

      const jobPost = await JobPostModel.findOne({ _id: jobPostId, isActive: true, deletedAt: null }).populate("recruiterId", "_id name fcmToken");
      if (!jobPost) return apiResponse.NOT_FOUND({ res, message: message.job_post_not_found });

      // If file uploaded, store URL from S3
      let refundUrl = "";
      if (req.file && req.file.location) {
        refundUrl = req.file.location;
      } else {
        return apiResponse.VALIDATION_ERROR({ res, message: message.refund_payment_image_required });
      }

      await JobPostModel.findByIdAndUpdate(jobPostId, { refundUrl: refundUrl, status: APPLICATION_STATUS.REFUND_COMPLETED })

      // notification
      const title = "Refund Credited"
      const msg = `${jobPost.recruiterId.name}'s refund for ${jobPost.title} post has been successfully credited. Request ID: ${jobPost._id}.`
      await Promise.all([
        sendNotification(jobPost.recruiterId.fcmToken, title, msg),
        NotificationModel.create({ userId: jobPost.recruiterId._id, title: title, body: msg, })
      ])
      return apiResponse.OK({ res, message: msg });

    } catch (err) {
      console.log("Error sendRefundToHospital to job:", err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },
};
