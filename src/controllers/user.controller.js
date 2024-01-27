const asyncHandler = require("../utils/asyncHandler");
const errFormat = require("../utils/errorFormat");
const User = require("../models/user.model");
const { cloudinaryUploader } = require("../utils/cloudinary");
const resFormat = require("../utils/responseFormat");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new errFormat(500, "Something went wrong while generating tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  if (
    [fullName, username, password, email].some((field) => field?.trim() === "")
  ) {
    throw new errFormat(400, "Please fill all fields");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new errFormat(
      409,
      "User with provided email and username already exists."
    );
  }

  const avatarLocalPath = req.files.avatar[0]?.path;
  if (!avatarLocalPath) {
    throw new errFormat(400, "Please upload an avatar");
  }

  let coverImageLocalPath;
  let coverImage;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  const avatar = await cloudinaryUploader(avatarLocalPath);
  if (coverImageLocalPath) {
    coverImage = await cloudinaryUploader(coverImageLocalPath);
  }

  const newUser = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(newUser._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new errFormat(500, "Something went wrong while creating user");
  }

  return res
    .status(201)
    .json(new resFormat(200, createdUser, "User created successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, password, email } = req.body;

  if (!username && !email) {
    throw new errFormat(400, "Please provide username or email");
  }

  const registeredUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!registeredUser) {
    throw new errFormat(
      404,
      "No registered user with provided username or password."
    );
  }

  const isPasswordMatched = await registeredUser.isPasswordCorrect(password);

  if (!isPasswordMatched) {
    throw new errFormat(401, "Incorrect password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    registeredUser._id
  );

  const loggedInUser = await User.findById(registeredUser._id).select({
    password: 0,
    refreshToken: 0,
  });

  const cookieOptions = {
    // only modifiable from the server
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new resFormat(200, "User logged in successfully", {
        user: loggedInUser,
        accessToken,
        refreshToken,
      })
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  const cookieOptions = {
    // only modifiable from the server
    httpOnly: true,
    secure: true,
  };

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  // clear the cookie
  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new resFormat(200, "User Logged out successfully."));
});

const refreshToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new errFormat(401, "Unauthorized request.");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new errFormat(401, "Invalid refresh token.");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new errFormat(401, "Refresh token is invalid or expired.");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user?._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new resFormat(200, "Token refreshed", { accessToken, refreshToken })
      );
  } catch (error) {
    throw new errFormat(401, "Invalid refresh token.", error);
  }
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);
  const isPasswordMatched = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordMatched) {
    throw new errFormat(401, "Incorrect password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new resFormat(200, "Password changed successfully."));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new resFormat(200, "Current User fetched successfully", req.user));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email, username } = req.body;

  if (!fullName && !email && !username) {
    throw new errFormat(400, "Please fill all the fields");
  }

  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email,
        username,
      },
    },
    {
      new: true,
    }
  ).select({ password: 0 });

  return res
    .status(200)
    .json(new resFormat(200, "Account updated successfully."));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file.path;

  if (!avatarLocalPath) {
    throw new errFormat(400, "Please upload an avatar");
  }

  const avatar = await cloudinaryUploader(avatarLocalPath);

  if (!avatar.url) {
    throw new Error(400, "Something went wrong while uploading avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: true,
    }
  ).select({ password: 0 });

  return res
    .status(200)
    .json(new resFormat(200, "Avatar updated successfully.", user));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file.path;

  if (!coverImageLocalPath) {
    throw new errFormat(400, "Please upload a cover image");
  }

  const coverImage = await cloudinaryUploader(coverImageLocalPath);

  if (!coverImage.url) {
    throw new Error(400, "Something went wrong while uploading cover image");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    {
      new: true,
    }
  ).select({ password: 0 });

  return res
    .status(200)
    .json(new resFormat(200, "Cover image updated successfully.", user));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username) {
    throw new errFormat(400, "Please provide username");
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscription",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "Subscription",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        subscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: [
            { $in: [req.user?._id, "$subscribers.subscriber"] },
            true,
            false,
          ],
        },
      },
    },
    {
      $project: {
        password: 0,
        refreshToken: 0,
        createdAt: 0,
        updatedAt: 0,
      },
    },
  ]);
  // console.log("Aggregate result: ", channel);

  if (!channel?.length) {
    throw new errFormat(404, "No channel found with provided username");
  }

  return res
    .status(200)
    .json(new resFormat(200, "Channel fetched successfully. ", channel[0]));
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  if (!user?.length) {
    throw new errFormat(404, "No user found with provided id");
  }

  return res
    .status(200)
    .json(new resFormat(200, "Watch history fetched", user[0].watchHistory));
});

module.exports = {
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
};
