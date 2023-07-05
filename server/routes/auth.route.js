const express = require("express");
const authController = require("../controllers/auth.controller");
const auth = require("../middlewares/auth");
const router = express.Router();

//api/auth/signinWithGoogle
router.post("/signinWithGoogle", authController.getGoogleOauthUrl);

//api/auth/oauth
router.get("/oauth", authController.googleOauthHandler);

//api/auth/isauth
router.get("/isauth", auth(), authController.isauth);

module.exports = router;
