const express = require("express");
const authController = require("../controllers/auth.controller");
const auth = require("../middlewares/auth");
const router = express.Router();

//api/auth/register
router.post("/register", authController.register);

//api/auth/signin
router.post("/signin", authController.signin);

//api/auth/isauth
router.get("/isauth", auth(), authController.isauth);

module.exports = router;
    