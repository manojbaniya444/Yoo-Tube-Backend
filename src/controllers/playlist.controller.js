const asyncHandler = require("../utils/asyncHandler");

const createPlaylist = asyncHandler(async (req, res, next) => {});

const getUserPlaylist = asyncHandler(async (req, res, next) => {});

const getPlaylistById = asyncHandler(async (req, res, next) => {});

const addVideoToPlaylist = asyncHandler(async (req, res, next) => {});

const removeVideoFromPlaylist = asyncHandler(async (req, res, next) => {});

const updatePlaylist = asyncHandler(async (req, res, next) => {});

module.exports = {
  createPlaylist,
  getUserPlaylist,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  updatePlaylist,
};
