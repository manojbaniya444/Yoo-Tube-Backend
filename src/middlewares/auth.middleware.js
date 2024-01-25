const jwt = require("jsonwebtoken");
const errFormat = require("../utils/errorFormat");
const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/user.model");

const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new errFormat(401, "Unauthorized request.");
    }

    const decoded = await jwt.verify(token, process.env.ACCESS_SECRET);

    if (!decoded) {
      throw new errFormat(401, "Unauthorized request.");
    }

    const user = await User.findById(decoded._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new errFormat(401, "Unauthorized request.");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new errFormat(401, error?.message || "Unauthorized request.");
  }
});

module.exports = { verifyJWT };
