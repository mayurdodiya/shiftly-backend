const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

aws.config.update({
  secretAccessKey: process.env.SECRET_KEY,
  accessKeyId: process.env.ACCESSKEYID,
  region: process.env.REGION,
});

const s3 = new aws.S3();
// working code
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.originalname });
    },
    key: function (req, file, cb) {
      cb(null, "/upload" + "-" + Math.floor(Math.random() * 1000) + "." + file.mimetype.split("/")[1]);
    },
  }),

  limits: { files: 10 },
});



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const localUpload = multer({ storage: storage });

    // trying for resume preview
    // const upload = multer({
    //   storage: multerS3({
    //     s3: s3,
    //     bucket: process.env.BUCKET,
    //     acl: "public-read",
    //     contentType: multerS3.AUTO_CONTENT_TYPE,
    //     metadata: function (req, file, cb) {
    //       cb(null, { fieldName: file.originalname });
    //     },
    //     key: function (req, file, cb) {
    //       const ext = file.mimetype.split("/")[1];
    //       cb(null, "upload-" + Date.now() + "." + ext);
    //     },
    //   }),
    //   limits: { files: 10 },
    // });
module.exports = { upload, localUpload };