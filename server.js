const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { readdirSync } = require("fs");

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "20mb" }));

readdirSync("./routes").map((c) =>
  app.use("/api/", require("./routes/" + c))
);

module.exports = app;
