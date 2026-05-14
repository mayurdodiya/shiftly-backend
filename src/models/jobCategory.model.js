const mongoose = require("mongoose");

const jobCategorySchema = mongoose.Schema(
  {
    categoryName: {
      type: String,
      trim: true,
      required: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const JobCategory = mongoose.model("jobCategory", jobCategorySchema, "jobCategory");
module.exports = JobCategory;