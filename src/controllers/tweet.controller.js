const asyncHandler = require("../utils/asyncHandler");

const createTweet = asyncHandler(async (req, res, next) => {});

const getUserTweets = asyncHandler(async (req, res, next) => {});

const updateTweet = asyncHandler(async (req, res, next) => {});

const deleteTweet = asyncHandler(async (req, res, next) => {});

module.exports = { createTweet, getUserTweets, updateTweet, deleteTweet };
