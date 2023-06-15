const { User } = require("../models/user");
const ApiError = require("../middlewares/apiError");
const httpStatus = require("http-status");
const jwt = require("jsonwebtoken");

const validateToken = async (token) => {
  return jwt.verify(token, process.env.APP_SECRET);
};

const decodeToken = async (token) => {};
const findUserByEmail = (email) => {
  return User.findOne({ email });
};

const findUserById = async (_id) => {
  return User.findById({ _id });
};

module.exports = {
  findUserByEmail,
  findUserById,
  validateToken,
};
