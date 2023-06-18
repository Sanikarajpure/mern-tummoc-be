const { User } = require("../models/user");
const axios = require("axios");
const { ApiError } = require("../middlewares/apiError");
const httpStatus = require("http-status");
const jwt = require("jsonwebtoken");
const qs = require("querystring");

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

const getGoogleOAuthTokens = async ({ code }) => {
  const url = "https://oauth2.googleapis.com/token";

  const values = {
    code,
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    redirect_uri: process.env.REDIRECT_URL,
    grant_type: "authorization_code",
  };

  try {
    const res = await axios.post(url, qs.stringify(values), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return res.data;
  } catch (error) {
    console.error(error);
  }
};

const getGoogleUser = async ({ id_token, access_token }) => {
  try {
    const res = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
      {
        headers: {
          Authorization: `Bearer ${id_token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    throw new Error(error.message);
  }
};

const findAndUpdateUser = async (query, update, options) => {
  return User.findOneAndUpdate(query, update, options);
};

module.exports = {
  findUserByEmail,
  findUserById,
  validateToken,
  getGoogleOAuthTokens,
  getGoogleUser,
  findAndUpdateUser,
};
