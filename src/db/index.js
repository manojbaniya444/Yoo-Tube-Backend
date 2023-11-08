const mongoose = require("mongoose");

const connectToDatabase = async () => {
  try {
    const connectMongoDbInstance = await mongoose.connect(
      process.env.MONGO_URI
    );
  } catch (error) {
    console.log("Error occured while connecting to the database ", error);
    process.exit(1);
  }
};

module.exports = connectToDatabase