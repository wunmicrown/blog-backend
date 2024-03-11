"use strict"
const express = require('express');
const app = express();
require("dotenv").config(); // load environment variables from .env file
let PORT = process.env.PORT || 4000;

app.get('/', (req, res) => {
   return res.status(200).send('App is Woking')                
})




app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
})