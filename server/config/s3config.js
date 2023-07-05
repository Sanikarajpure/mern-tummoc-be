const { S3Client } = require("@aws-sdk/client-s3");
const crypto = require("crypto");
const region = process.env.S3_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

const generateFileName = (originalname) => {
  return `${crypto.randomBytes(16).toString("hex") + "%" + originalname}`;
};

module.exports = { s3Client, generateFileName };
