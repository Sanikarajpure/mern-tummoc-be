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

const authController = {
  async register(req, res, next) {
    try {
      //validating using joi
      console.log(req.body);
      let value = await registerSchema.validateAsync(req.body);

      if (value) {
        //chechking if email is taken
        if (await User.emailTaken(value.email)) {
          throw new ApiError(httpStatus.BAD_REQUEST, "User already exists!");
        }
        console.log(value);

        let user = await authService.createUser(
          value.email,
          value.password,
          value.firstName,
          value.lastName,
          value.phone,
          value.city
        );

        res.status(httpStatus.CREATED).send({
          user,
        });
      }
    } catch (error) {
      next(error);
    }
  },

  async signin(req, res, next) {
    try {
      //validating user login data using joi
      let value = await loginSchema.validateAsync(req.body);

      if (value) {
        const user = await authService.signInEmailAndPassword(
          value.email,
          value.password
        );

        //setting access token
        let token = await authService.genAuthToken(user);

        res
          .cookie("x-access-token", token, {
            expires: authService.setExpiry(7),
          })
          .status(httpStatus.OK)
          .send({
            user,
          });
      }
    } catch (error) {
      next(error);
    }
  },
  async isauth(req, res, next) {
    let auth = req.authenticated;

    let _id = auth.id;
    let user = await userService.findUserById(_id);

    if (auth && user) {
      res.status(httpStatus.OK).send(user);
    }
  },

  async getGoogleOauthUrl(req, res, next) {
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";

    const options = {
      redirect_uri: process.env.REDIRECT_URL,
      client_id: process.env.CLIENT_ID,
      response_type: "code",
      prompt: "consent",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ].join(" "),
    };

    const qs = new URLSearchParams(options);

    let url = ` ${rootUrl}?${qs.toString()}`;
    res.status(httpStatus.OK).send(url);
  },

  async googleOauthHandler(req, res, next) {
    const code = req.query.code;
    try {
      //get id and access-token with code
      const response = await userService.getGoogleOAuthTokens({ code });

      const id_token = response.id_token;
      const access_token = response.access_token;
      // get user wiyth tokens
      const googleUser = await userService.getGoogleUser({
        id_token,
        access_token,
      });

      //upsert the user in db

      if (!googleUser.verified_email) {
        return res
          .status(httpStatus.BAD_REQUEST)
          .send("Google Account not verified!");
      }

      const user = await userService.findAndUpdateUser(
        {
          email: googleUser.email,
        },
        {
          email: googleUser.email,
          firstName: googleUser.given_name,
          lastName: googleUser.family_name,
        },
        { upsert: true, new: true }
      );

      //setting access token
      let token = await authService.genAuthToken(user);

      res.cookie("x-access-token", token, {
        expires: authService.setExpiry(7),
      });

      // redirect back to client
      res.redirect(`${process.env.LOGIN_REDIRECT}`);
    } catch (error) {
      return res.redirect(`${process.env.ORIGIN}`);
    }
  },
};
module.exports = authController;
