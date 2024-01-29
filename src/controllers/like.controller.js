const mongoose = require("mongoose");
const asyncHandler = require("../utils/asyncHandler");

const toggleVideoLike = asyncHandler(async (req, res, next) => {
  const { videoId } = req.params;
});

const toggleCommentLike = asyncHandler(async (req, res, next) => {});

const toggleTweetLike = asyncHandler(async (req, res, next) => {});

module.exports = { toggleVideoLike, toggleCommentLike, toggleTweetLike };
