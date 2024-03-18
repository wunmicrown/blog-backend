'use strict'
const asyncHandler = require('express-async-handler');
const User= require('../../model/user/user.model');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const { excludeFields } = require('../../utils/common.methods');
const passport = require('passport');

//-----User Controller---
const userController ={
  // !Register
  /**
 * Registers a new user by saving their details (including OTP) to the database and sending a verification email.
 * 
 * @param {Object} req - The request object containing user details in the body.
 * @param {Object} res - The response object to send back to the client.
 * @returns {Promise<void>} - A promise that resolves once the registration process is complete.
 */
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
          // newUser =excludeFields(newUser.toObject(),['password', '__v'])
          console.log("newUser:", newUser);
          const userSaved = await newUser.save();
          console.log("user saved:", userSaved);
          return res.status(200).json({messege:'registered successful', user:newUser});

  }),

  // ! Login
  /**
 * Logs in a user by verifying their email and password.
 * 
 * @param {Object} req - The request object containing user's email and password in the body.
 * @param {Object} res - The response object to send back to the client.
 * @returns {Promise<void>} - A promise that resolves once the login process is complete.
 */
  login: asyncHandler(async (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      //check if user not found
      if (!user) {
        return res.status(401).json({ message: info.message });
      }
      //generate token
      const token = jwt.sign({ id: user?._id }, process.env.JWT_SECRET);
      //set the token into cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, //1 day
      });

      //send the response
      res.json({
        status: "success",
        message: "Login Success",
        username: user?.username,
        email: user?.email,
        _id: user?._id,
      });
    })(req, res, next);
  }),
  
}


module.exports = userController;
