const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multer.middleware");
const { registerUser } = require("../controllers/user.controller");

router.post(
  "/register",
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  registerUser
);

module.exports = router;
