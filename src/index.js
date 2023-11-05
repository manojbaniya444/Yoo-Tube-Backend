const dotenv = require("dotenv");
const connectToDatabase = require("./db");

dotenv.config();

connectToDatabase();
