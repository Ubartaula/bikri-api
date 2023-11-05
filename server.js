require("dotenv").config();
require("express-async-errors");
const express = require("express");
const connectDB = require("./config/connectDB");
const { default: mongoose } = require("mongoose");
const path = require("path");
const logger = require("./middleware/logger");
const cors = require("cors");
const corsOptions = require("./config/corsOption");
const errorHandler = require("./middleware/errorHandler");
const logEvent = require("./middleware/logEvent");
const cookieParser = require("cookie-parser");

const {
  cleanLogFile,
  interval,
  deleteUploads,
} = require("./middleware/CleanRecords");
const compression = require("compression");
const app = express();
const PORT = process.env.PORT || 3100;

//connect Data Base
connectDB;

// to clean logRecods
setInterval(cleanLogFile, interval);
setInterval(deleteUploads, 1000 * 60);

//logger and cors
app.use(cors(corsOptions));
// app.use(cors());
app.use(logger);

//built middleware
app.use(express.json());
app.use(cookieParser());

//route
app.use(compression());
app.use("/", require("./route/rootRoute"));
app.use("/auth", require("./route/authRoute"));
app.use("/test", require("./route/testRoute"));
app.use("/items", require("./route/itemRoute"));
app.use("/category-items", require("./route/categoryItemRoute"));
app.use("/comments", require("./route/commentRoute"));
app.use("/users", require("./route/userRoute"));
app.use("/reset", require("./route/resetPassword"));

// Route to fetch comments based on query parameters
// http://localhost:3400/comments/query?item=6501732412c985507e2cdfdb

app.get("/comments/query", async (req, res) => {
  try {
    const { item, user } = req.query;
    let query = {};

    if (user) {
      query.user = user;
    }

    if (item) {
      query.item = item;
    }

    const comments = await Comment.find(query);

    res.json(comments);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// handling not found
app.use("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "no json data available" });
  } else {
    res.send(" no such key word match, please re type your search key word");
  }
});

//error handler
app.use(errorHandler);

//connection to mongo
mongoose.connection.once("open", () => {
  console.log(`your app is connected to mongo data base`);
  app.listen(PORT, () => {
    console.log(`app is running on ${PORT}`);
  });
});

//catching mongo error
mongoose.connection.on("error", (err) => {
  // console.log(err);
  logEvent(
    `${new Date()} -- ${err?.no} --- ${err?.code}---${err?.syscall} ---${
      err?.hostname
    }\n`,
    "mongoErr.log"
  );
});
