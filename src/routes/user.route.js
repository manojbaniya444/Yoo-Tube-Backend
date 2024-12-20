const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multer.middleware");
const {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  changePassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
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

router.post("/change-password", verifyJWT, changePassword);

router.get("/current-user", verifyJWT, getCurrentUser);

router.patch("/update-user", verifyJWT, updateAccountDetails);

router.patch(
  "/update-avatar",
  verifyJWT,
  upload.single("avatar"),
  updateUserAvatar
);

router.patch(
  "/update-cover-image",
  verifyJWT,
  upload.single("coverImage"),
  updateUserCoverImage
);

router.get("/profile/:username", verifyJWT, getUserChannelProfile);

router.get("/history", verifyJWT, getWatchHistory);

module.exports = router;
