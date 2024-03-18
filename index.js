"use strict"
const express = require('express');
const usersRouter = require('./routes/user/usersRoutes');
const app = express();
const cookieParser = require("cookie-parser");
require("dotenv").config(); // load environment variables from .env file
let PORT = process.env.PORT || 4000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cookieParser()); //automattically parses the cookie


app.get('/', (req, res) => {
    return res.status(200).json({ message: "Welcome to Blog Project" })
})
app.use("/api/v1/users", usersRouter)

//!Not found
app.use((req, res, next) => {
    res.status(404).json({ message: "Route not found on our server" });
});

//! Error handdling middleware
app.use((err, req, res, next) => {
    //prepare the error message
    const message = err.message;
    const stack = err.stack;
    res.status(500).json({ message, stack });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})