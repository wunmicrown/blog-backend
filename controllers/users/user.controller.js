'use strict'
const asyncHandler = require('express-async-handler');
const User= require('../../model/user/user.model');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const { excludeFields } = require('../../utils/common.methods');
const jwt = require("jsonwebtoken");

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
 login :asyncHandler(async (req, res) => {
  // Destructure email and password from the request body
  const { email, password } = req.body;
  console.log({ email, password });
  // Find the user by email
  const user = await User.findOne({ email });
  console.log(user);
  const _user = excludeFields(user.toObject(), ['password', 'otp', "__v"]);
  console.log(_user);
  // Check if user exists
  if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "Invalid credentials", status: false });
  }
  // Log the plaintext password and the hashed password retrieved from the database
  const match = await bcrypt.compare(password, user.password);
  console.log("Plaintext password:", password);
  console.log("Hashed password from database:", user.password);
  console.log("bcrypt.compare result:", match);
  // Check if passwords match
  if (!match) {
      console.log("Incorrect password");
      return res.status(401).send({ message: "Invalid credentials", status: false });
  }

  // Password is correct, generate JWT token for authentication
  const token = jwt.sign({ email }, process.env.JWT_SECRET);
  //set the token into cookie
  res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, //1 day
  });
  // Send successful login response with user details and token
  return res.status(200).json({ message: "Login successful", status: true, user: _user, token });
}),
  
}


module.exports = userController;
