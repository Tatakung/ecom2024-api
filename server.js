// Step 1 import ....
const express = require('express')
const app = express()
const morgan = require('morgan')
const { readdirSync } = require('fs')
const cors = require('cors')
// const authRouter = require('./routes/auth')
// const categoryRouter = require('./routes/category')

// middleware
app.use(morgan('dev'))
app.use(express.json({ limit: '20mb' }))
app.use(cors())

readdirSync("./routes").map((c) => app.use("/api/", require("./routes/" + c)));

app.listen(5000, () => {
  console.log("server runing");
});
