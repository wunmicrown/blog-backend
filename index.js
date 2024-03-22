"use strict"
const express = require('express');
const app = express();
const cookieParser = require("cookie-parser");
const usersRouter = require('./routes/usersRoutes');
const postsRoutes = require('./routes/postsRoutes');
const categoriesRoutes = require('./routes/categoriesRoutes');
require("dotenv").config(); // load environment variables from .env file
let PORT = process.env.PORT || 4000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Serve uploaded files statically from the 'uploads' directory
app.use("/uploads", express.static("uploads"))

app.use(cookieParser()); //automattically parses the cookie

app.get('/', (req, res) => {
    return res.status(200).json({ message: "Welcome to Blog Project" })
})

app.use("/api/v1/users", usersRouter);
app.use("/api/v1/posts", postsRoutes);
app.use("/api/v1/categories", categoriesRoutes);


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