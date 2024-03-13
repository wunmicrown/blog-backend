"use strict"
const express = require('express');
const app = express();
const router = express.Router();
const routers = require('./routes/auth.route');
require("dotenv").config(); // load environment variables from .env file
let PORT = process.env.PORT || 4000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


router.get('/', (req, res) => {
    return res.status(200).send('App is Woking')                
})
// app.use('/', router);
// app.use('/v1', routers);



app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
})