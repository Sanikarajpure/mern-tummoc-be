const { User } = require("../models/user");
const httpStatus = require("http-status");
const { ApiError } = require("../middlewares/apiError");
const userService = require("./user.service");

const createUser = async (email, password, firstName, lastName, phone) => {
  try {
    if (await User.emailTaken(email)) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Email already registered");
    }

    const user = new User({
      email,
      password,
      firstName,
      lastName,
      phone,
    });

    await user.save();
    return user;
  } catch (error) {
    throw error;
  }
};

const signInEmailAndPassword = async (email, password) => {
  try {
    const user = await userService.findUserByEmail(email);

    if (!user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "No user with this email");
    }
    if (!(await user.comparePassword(password))) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Wrong password");
    }

    return user;
  } catch (error) {
    throw error;
  }
};

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
  createUser,
  signInEmailAndPassword,
  genAuthToken,
  setExpiry,
};
