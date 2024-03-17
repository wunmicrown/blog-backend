'use strict'
const asyncHandler = require('express-async-handler');
const User= require('../../model/user/user.model');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const { excludeFields } = require('../../utils/common.methods');

//-----User Controller---
const userController ={
  // !Register
  register :asyncHandler(async (req, res) => {
   
    const { username, email, password } = req.body;
        console.log({emailBody:email, username:username, password:password});

        const userExists = await User.findOne({ username,email });
        if (userExists) {
          return res.status(409).send("User already exists");
        }

          //Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);
            console.log("password:",hashedPassword);
          

          let newUser = new User(req.body);
        //   newUser =excludeFields(User.toObject(),['password', '__v'])
          console.log("newUser:", newUser);
          await newUser.save();
          return res.status(200).json({messege:'registered successful', user:newUser});

   
          // catch (err) {
            //     // return res.status(401).send('Bad request');
            // throw new Error("Error during signup:", err);

    // }              
    // return res.status(200).send('signup route is working now ');

  }),
  
}


module.exports = userController;
