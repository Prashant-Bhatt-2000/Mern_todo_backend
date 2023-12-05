const express = require('express')

const app = express()

app.use(express.json());

const user = require('./routes/authRoutes')
const todo = require('./routes/todoRoutes')

app.use("/api/v1/", user)
app.use("/api/v1/", todo)

module.exports = app