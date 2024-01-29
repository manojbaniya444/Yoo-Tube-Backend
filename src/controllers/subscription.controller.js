const asyncHandler = require("../utils/asyncHandler");

const toggleSubscription = asyncHandler(async (req, res, next) => {});

const getUserChannelSubsscribers = asyncHandler(async (req, res, next) => {});

const getSubscribedChannels = asyncHandler(async (req, res, next) => {});

module.exports = {
  toggleSubscription,
  getUserChannelSubsscribers,
  getSubscribedChannels,
};
