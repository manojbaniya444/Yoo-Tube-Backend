const dotenv = require("dotenv");
dotenv.config();

const connectToDatabase = require("./db");
const app = require("./app");

const PORT = process.env.PORT;

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
