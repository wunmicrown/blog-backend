'use strict'
const bcrypt = require('bcrypt');
const asyncHandler = require('express-async-handler');
const nodemailer = require("nodemailer");
const User = require('../../model/user/user.model');
const { excludeFields } = require('../../utils/common.methods');
const jwt = require("jsonwebtoken");
const { sendOtpEmail } = require('../../utils/mails/mailsender');
const { resetEmailOtp } = require('../../utils/mails/resetmailSender');
const { changedEmailTemplate } = require('../../utils/otpTemplate');
const { cloudDelete } = require('../../utils/cloudinary.utils');

// global varibale for genarating OTP
const generateSixDigitNumber = () => {
  return Math.floor(Math.random() * 900000) + 100000;
};
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: process.env.MAIL_USE_TLS, // Convert string to boolean
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  }
});


//-----User Controller---
const userController = {
  // !Register
  /**
 * Registers a new user by saving their details (including OTP) to the database and sending a verification email.
 * 
 * @param {Object} req - The request object containing user details in the body.
 * @param {Object} res - The response object to send back to the client.
 * @returns {Promise<void>} - A promise that resolves once the registration process is complete.
 */
  register: asyncHandler(async (req, res) => {

    const { username, email, password } = req.body;
    // console.log({ emailBody: email, username: username, password: password });

    const userExists = await User.findOne({ username, email });
    if (userExists) {
      return res.status(409).send("User already exists");
    }

    //Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("password:", hashedPassword);


    const newUser = new User(req.body);
    const _user = excludeFields(newUser.toObject(), ['password', 'otp', "__v"]);
    console.log("newUser:", newUser);
    await newUser.save();
    await sendOtpEmail(email, username);
    console.log(sendOtpEmail(email, username));
    return res.status(200).json({ message: 'Registration successful. Please check your email to verify your account.', user: _user });
  }),

  // ! Login
  /**
 * Logs in a user by verifying their email and password.
 * 
 * @param {Object} req - The request object containing user's email and password in the body.
 * @param {Object} res - The response object to send back to the client.
 * @returns {Promise<void>} - A promise that resolves once the login process is complete.
 */
  login: asyncHandler(async (req, res) => {
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

    // Check if the email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({ message: "Email not verified. Please verify your email to log in.", status: false });
    }

    // Log the plaintext password and the hashed password retrieved from the database
    // const match = await bcrypt.compare(password, user.password);
    // console.log("Plaintext password:", password);
    // console.log("Hashed password from database:", user.password);
    // console.log("bcrypt.compare result:", match);

    // Check if passwords match
    // if (!match) {
    //   console.log("Incorrect password");
    //   return res.status(401).send({ message: "Invalid credentials", status: false });
    // }

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

  /**
   * Verifies the OTP (One-Time Password) entered by the user for email verification.
   * 
   * @param {Object} req - The request object containing the OTP code in the body.
   * @param {Object} res - The response object to send back to the client.
   * @returns {Promise<void>} - A promise that resolves once the OTP verification process is complete.
   */
 // Backend code to handle OTP verification
 verifyEmail :asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  console.log({ email, otp });
  try {
    // Find the user by email
    let user = await User.findOne({ email });
    console.log(user);
    if (!user) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    // If OTP is correct, mark email as verified
    user.isEmailVerified = true;
    user = await user.save();
    user = excludeFields(user.toObject(), ["password", "otp"])
    return res.status(200).json({ message: "Email successfully verified", user });
  } catch (error) {
    console.error("Error verifying email:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}),
  

  // !ResetEmail
  /**
 * Resets the email verification OTP (One-Time Password) for a user and sends the new OTP to their email address.
 * 
 * @param {Object} req - The request object containing the user's email in the body.
 * @param {Object} res - The response object to send back to the client.
 * @returns {Promise<void>} - A promise that resolves once the OTP reset process is complete.
 */
  resetEmail: asyncHandler(async (req, res) => {
    const { email } = req.body;
    console.log("email:", email)
    try {
      // Find the user by email
      const userEmail = await User.findOne({ email });
      console.log("userEmail:", userEmail);

      if (userEmail) {

        await userEmail.save();
        await resetEmailOtp(email);
        console.log(resetEmailOtp(email));
        // Send success response
        res.status(200).json({ message: 'OTP sent and user updated successfully', status: true });
      } else {
        // User not found
        res.status(404).json({ message: 'User does not exist', status: false });
      }
    } catch (err) {
      // Handle errors
      console.error('Error sending OTP:', err);
      res.status(500).json({ message: 'Oops! Something went wrong', status: false });
    }
  }),

  // !ResetPassword
  /**
 * Resets the password for a user and updates it in the database.
 * 
 * @param {Object} req - The request object containing the user's email and new password in the body.
 * @param {Object} res - The response object to send back to the client.
 * @returns {Promise<void>} - A promise that resolves once the password reset process is complete.
 */
  resetPassword: asyncHandler(async (req, res) => {
    const { email, newPassword } = req.body;
    console.log("email:", email, "newPassword:", newPassword);

    // Validate the request payload
    if (!email || !newPassword) {
      return res.status(400).json({ message: "Missing required fields", status: false });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log(hashedPassword)
    // Update the user's password in the database
    try {
      const updateUser = await User.findOneAndUpdate({ email }, { password: hashedPassword });
      console.log(updateUser)
      if (updateUser) {
        // Password reset successful
        return res.status(200).json({ message: 'Password reset successful', status: true });
      } else {
        // User not found
        return res.status(404).json({ message: 'User not found', status: false });
      }
    } catch (error) {
      // Handle other errors
      console.error('Error resetting password:', error);
      return res.status(500).json({ message: 'Internal server error', status: false });
    }
  }),

  changePassword: asyncHandler(async (req, res) => {
    try {
      const { email, oldPassword, newPassword } = req.body;
      console.log({ email, oldPassword, newPassword });

      // Hash the new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Find the user by email and update the password
      const user = await User.findOneAndUpdate({ email }, { password: hashedNewPassword }, { new: true });
      console.log(user);
      // Check if user exists
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Compare the old password provided with the hashed password stored in the database
      const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
      console.log(isPasswordValid);
      // If the old password is not valid, return an error
      if (isPasswordValid) {
        return res.status(400).json({ message: 'Invalid old password' });
      }

      // Return a success response
      return res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Error changing password:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }),

  changeEmail: asyncHandler(async (req, res) => {
    try {
      const { email } = req.body;
      const userId = req.auth_id; // Extract user ID from authenticated request

      // Check if the new email is already in use
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email address is already in use' });
      }

      // Generate OTP
      const otp = generateSixDigitNumber(); // You need to implement this function

      // Fetch user data
      const user = await User.findById(userId);

      // Send OTP to the new email address 
      const mailOptions = {
        from: `"Blogify" ${process.env.MAIL_USER}`,
        to: email,
        subject: 'Verify Your Email',
        html: changedEmailTemplate(user.username, otp) // Assuming you have access to firstName in your user model
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
          res.status(500).send("Failed to send verification email");
        } else {
          console.log('Email sent: ' + info.response);
          res.status(201).send({ message: "Verification OTP sent to email.", user: user });
        }
      });

      // Save the OTP in the user's document in the database
      const updatedUser = await User.findByIdAndUpdate(userId, { email, otp }, { new: true });

      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ status: true, message: 'OTP sent to your email address for verification' });
    } catch (error) {
      console.error('Error updating email:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }),

  uploadProfilePicture: asyncHandler(async (req, res) => {
    if (!req.file || Object.keys(req.file).length === 0) {
      return res.status(400).json({ message: 'No files were uploaded.' });
    }

    const user = await User.findById(req.auth_id);
    console.log("User:", user);
    const oldPic = user.profilePic ?? null;
    if (oldPic) {
      // Below for cloudinary deletion
      let id = oldPic.split('/').pop().split('.')[0];
      const { status, error } = await cloudDelete(id);
      if (!status) {
        console.log(error);
        return res.status(500).json({ message: 'Failed to delete old image.' });
      }
    }

    // Using (multer-storage-cloudinary) i.e not pre-saving file to local disk
    user.profilePic = req.file.path;
    await user.save(); // Await the save operation

    const _user = excludeFields(user.toObject(), ["otp", "password", "__v"]);
    return res.status(200).json({ message: 'Image uploaded successfully', user: _user });
  }),
  /**
 * Fetches user details based on the authenticated user's ID.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {void}
 */
getUserDetails :asyncHandler (async (req, res) => {
  try {

    // req.auth_id from middle ware
    // Retrieve user details from the database based on the authenticated user's ID
    const userId = req.auth_id; // Assuming you're storing the user ID in the JWT payload
    console.log(userId);  
    const user = await User.findById(userId).select('-password -otp -__v');
    console.log({user});   
    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // user = excludeFields(user.toObject(), ['password', 'otp', "__v"]);
    return res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}),
}


module.exports = userController;
