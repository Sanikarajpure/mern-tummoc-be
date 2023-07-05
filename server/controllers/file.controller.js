const { ApiError } = require("../middlewares/apiError");
const httpStatus = require("http-status");
const jwt = require("jsonwebtoken");
const {
  fileValidationSchema,
  getAllFilesValidationSchema,
} = require("../validations/fileValidation");
const { s3Client, generateFileName } = require("../config/s3config");
const { userService } = require("../services/");
const { PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
require("dotenv").config();

const bucketName = process.env.S3_BUCKET;

const fileController = {
  async getAllFiles(req, res, next) {
    try {
      const values = await getAllFilesValidationSchema.validateAsync({
        id: req.query.id,
      });

      let result = [];

      const user = await userService.findUserById({ _id: values.id });
      if (user) {
        for (let i = 0; i < user.files.length; i++) {
          let getObjectParams = {
            Bucket: bucketName,
            Key: user.files[i],
          };

          const command = new GetObjectCommand(getObjectParams);

          const url = await getSignedUrl(s3Client, command, {
            expiresIn: 3600,
          });

          let file = {
            fileName: user.files[i],
            url: url,
          };

          result.push(file);
        }

        res.send({
          status: httpStatus.FOUND,
          result,
        });
      } else {
        res.send({
          status: httpStatus.NOT_FOUND,
          result,
        });
      }
    } catch (error) {
      next(error);
    }
  },

  async uploadFile(req, res, next) {
    try {
      const values = await fileValidationSchema.validateAsync({
        id: req.body.id,
        file: req.file,
      });

      let file = `${generateFileName(values.file.originalname)}`;

      const uploadParams = {
        Bucket: bucketName,
        Body: values.file.buffer,
        Key: file,
        ContentType: values.file.mimetype,
      };

      // Send the upload to S3
      await s3Client.send(new PutObjectCommand(uploadParams));

      const user = await userService.findAndUpdateUser(
        {
          _id: values.id,
        },
        {
          $push: { files: file },
        },
        { upsert: true }
      );

      res.send({
        status: httpStatus.OK,
        message: "File uploaded sucessfully",
      });
    } catch (error) {
      next(error);
    }
  },
};
module.exports = fileController;
