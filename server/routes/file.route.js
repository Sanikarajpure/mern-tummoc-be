const express = require("express");
const fileController = require("../controllers/file.controller");
const auth = require("../middlewares/auth");
const upload = require("../config/multerConfig");
const router = express.Router();

//api/file/getAllFiles
router.get("/getAllFiles", auth(), fileController.getAllFiles);

//api/file/uploadFile
router.post(
  "/uploadFile",
  auth(),
  upload.single("file"),
  fileController.uploadFile
);

module.exports = router;
