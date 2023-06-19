const { ApiError } = require("../middlewares/apiError");
const { User } = require("../models/user");
const { authService, userService } = require("../services/");
const {
  registerSchema,
  loginSchema,
} = require("../validations/regitserLoginValidations");
const httpStatus = require("http-status");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const fs = require("fs");
(path = require("path")), (filePath = path.join(__dirname, "words.txt"));

const fileController = {
  async readFile(req, res, next) {
    try {
      const data = fs.readFileSync(filePath, { encoding: "utf-8" });
      console.log(data);

      res.status(httpStatus.OK).send(data);
    } catch (error) {
      next(error);
    }
  },

  async writeToFile(req, res, next) {
    try {
      const text = req.body.text;

      let data = fs.readFileSync(filePath, { encoding: "utf-8" });

      if (!data) {
        fs.writeFileSync(filePath, text);
      } else {
        fs.appendFileSync(filePath, text);
      }

      data = fs.readFileSync(filePath, { encoding: "utf-8" });

      res.status(httpStatus.OK).send(data);
    } catch (error) {
      next(error);
    }
  },
};
module.exports = fileController;
