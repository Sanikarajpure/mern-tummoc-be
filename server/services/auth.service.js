const { User } = require("../models/user");
const httpStatus = require("http-status");
const { ApiError } = require("../middlewares/apiError");
const userService = require("./user.service");


const genAuthToken = (user) => {
  try {
    const token = user.generateAuthToken();
    return token;
  } catch (error) {
    throw error;
  }
};
const setExpiry = (days) => {
  let date = new Date(Date.now() + days * 24 * 3600000);

  return date;
};

module.exports = {
  genAuthToken,
  setExpiry,
};
