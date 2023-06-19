const express = require("express");
const fileController = require("../controllers/file.controller");
const auth = require("../middlewares/auth");
const router = express.Router();

//api/file/read
router.get("/read", auth(), fileController.readFile);

//api/file/write
router.post("/write", auth(), fileController.writeToFile);

module.exports = router;
