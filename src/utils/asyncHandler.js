const asyncHandler = (func) => async (req, res, next) => {
  await func(req, res, next);
  try {
  } catch (error) {
    res.status(error.code || 500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = asyncHandler;
