const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const userRouter = require("./routes/user.route");

const app = express();

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api/v1/user", userRouter);
app.use("api/v1/tweets");
app.use("api/v1/subscriptions");
app.use("api/v1/videos");
app.use("api/v1/comments");
app.use("api/v1/likes");
app.use("api/v1/playlists");
app.use("api/v1/dashboard");

module.exports = app;
