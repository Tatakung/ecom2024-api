const express = require("express");
const cors = require("cors");
app.use(cors());
const app = express();
const morgan = require("morgan");
const { readdirSync } = require("fs");
app.use(morgan("dev"));
app.use(express.json({ limit: "20mb" }));

readdirSync("./routes").map((c) => app.use("/api/", require("./routes/" + c)));

app.listen(5000, () => {
  console.log("server runing");
});
