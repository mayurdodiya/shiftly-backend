const mongoose = require("mongoose");

const jobSubCategorySchema = mongoose.Schema(
  {
    jobCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "jobCategory",
      trim: true,
    },
    subCategoryName: {
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

const JobSubCategory = mongoose.model("jobSubCategory", jobSubCategorySchema, "jobSubCategory");
module.exports = JobSubCategory;