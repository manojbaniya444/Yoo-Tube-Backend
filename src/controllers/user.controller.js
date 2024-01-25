const asyncHandler = require("../utils/asyncHandler");
const errFormat = require("../utils/errorFormat");
const User = require("../models/user.model");
const { cloudinaryUploader } = require("../utils/cloudinary");
const resFormat = require("../utils/responseFormat");
const jwt = require("jsonwebtoken");

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

module.exports = { registerUser, loginUser, logoutUser, refreshToken };
