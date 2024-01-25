const cloudinary = require("cloudinary").v2;
const fs = require("node:fs");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudinaryUploader = async (filePath) => {
  try {
    if (!filePath) {
      throw new Error("No file path found");
    }
    const uploadResponse = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });
    fs.unlinkSync(filePath);
    return uploadResponse;
  } catch (error) {
    console.log("Error uploading file from cloudinary: ", error);
    fs.unlinkSync(filePath);
    return null;
  }
};

module.exports = { cloudinaryUploader };
