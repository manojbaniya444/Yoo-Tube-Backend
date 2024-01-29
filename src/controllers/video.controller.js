const asyncHandler = require("../utils/asyncHandler");

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
});

const publishVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
});

const getVideoById = asyncHandler(async (req, res) => {});

const updateVideo = asyncHandler(async (req, res) => {});

const deleteVideo = asyncHandler(async (req, res) => {});

const togglePublishStatus = asyncHandler(async (req, res) => {});

module.exports = {
  getAllVideos,
  publishVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
