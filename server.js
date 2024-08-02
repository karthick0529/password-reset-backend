const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const routes = require("./routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", routes);

// connect to mongodb

mongoose
  .connect(process.env.DB_CONNECTION_STRING)
  .then(() => console.log("MongoDB connected..."))
  .catch((err) => console.log(err));
app.listen(3000, () => console.log("Server started on localhost: 3000"));
