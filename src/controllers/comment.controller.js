const mongoose = require("mongoose");
const Comment = require("../models/comment.model");
const asyncHandler = require("../utils/asyncHandler");

const getVideoComments = asyncHandler(async (req, res, next) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
});

const addComment = asyncHandler(async (req, res, next) => {});

const updateComment = asyncHandler(async (req, res, next) => {});

const deleteComment = asyncHandler(async (req, res, next) => {});

module.exports = { getVideoComments, addComment, updateComment, deleteComment };
