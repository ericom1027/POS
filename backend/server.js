const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotEnv = require("dotenv");
require("colors");
const itemRoutes = require("./routes/items");
const userRoutes = require("./routes/user");
const billsRoutes = require("./routes/bills");
const shiftRoutes = require("./routes/shift");
const connectDb = require("./config/config");

// dotenv config
dotEnv.config();

const app = express();

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.get("/", (req, res) => {
  res.send("<h1>POS BACKEND</h1>");
});

connectDb();

app.use("/items", itemRoutes);
app.use("/users", userRoutes);
app.use("/bills", billsRoutes);
app.use("/shifts", shiftRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

const port = 5000;

app.listen(process.env.PORT || port, () => {
  console.log(
    `Server Running On Port ${process.env.PORT || port}`.bgGreen.white
  );
});

module.exports = { app, mongoose };
