"use strict"
const express = require('express');
const app = express();
const router = express.Router();
const usersRouter = require('./routes/user/usersRoutes');
require("dotenv").config(); // load environment variables from .env file
let PORT = process.env.PORT || 4000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


router.get('/', (req, res) => {
    return res.status(200).send('App is Woking')                
})
app.use("api/v1/users", usersRouter)



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})