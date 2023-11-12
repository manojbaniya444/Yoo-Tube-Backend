const dotenv = require("dotenv");
const connectToDatabase = require("./db");
const app = require("./app");

dotenv.config();

const PORT = process.env.PORT || 8080

//* Connecting to the database and starting server
connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running at PORT ${PORT}`);
    });
  })
  .catch((Error) => {
    console.log("Error connecting database: ", Error);
  });
