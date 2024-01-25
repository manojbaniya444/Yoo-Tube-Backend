const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multer.middleware");
const {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
} = require("../controllers/user.controller");
const { verifyJWT } = require("../middlewares/auth.middleware");

router.post(
  "/register",
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.post("/login", loginUser);

router.post("/logout", verifyJWT, logoutUser);

router.post("/refresh-token", verifyJWT, refreshToken);

module.exports = router;
