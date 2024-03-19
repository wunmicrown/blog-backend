'use strict'
const asyncHandler = require('express-async-handler');
const User = require('../../model/user/user.model');
const bcrypt = require('bcrypt');
const { excludeFields } = require('../../utils/common.methods');
const jwt = require("jsonwebtoken");
const { sendOtpEmail } = require('../../utils/mails/mailsender');
const { resetEmailOtp } = require('../../utils/mails/resetmailSender');
const { schemaValidatorHandler, resetPasswordlPayLoad } = require('../../validators/isAuthSchema');

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
    console.log({ emailBody: email, username: username, password: password });

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
  verifyEmail: asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    console.log("email:", email, "otp:", otp);
    try {
      // Find the user by email
      const userDetails = await User.findOne({ email });
      console.log(userDetails)
      // Check if user exists and OTP is correct
      if (!userDetails || userDetails.otp !== otp) {
        return res.status(400).json({ message: "Invalid OTP", status: false });
      }

      // Mark email as verified
      userDetails.isEmailVerified = true;
      const savedUser = await userDetails.save();
      console.log(savedUser);

      return res.status(200).json({ message: "Email successfully verified", status: true });
    } catch (error) {
      console.error("Error verifying email:", error);
      return res.status(500).json({ message: "Internal server error", status: false });
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
    console.log("email:",email)
    try {
      // Find the user by email
      const userEmail = await User.findOne({ email });
      console.log("userEmail:",userEmail);

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
 resetPassword : asyncHandler (async (req, res) => {
  const { email, newPassword } = req.body;
  console.log("email:",email, "newPassword:", newPassword);

  try {
    // Validate the request payload
  //   const validationResult = await schemaValidatorHandler(resetPasswordlPayLoad, { password: newPassword, email });
  //  console.log(validationResult)
  //   if (!validationResult.valid) {
  //     return res.status(400).json({ message: "Invalid request payload", errors: validationResult.error });
  //   }
    if (!email || !newPassword) {
      return res.status(400).json({ message: "Missing required fields", status: false });
    }
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
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
    // Handle errors
    console.error('Error resetting password:', error);
    return res.status(500).json({ message: 'Internal server error', status: false });
  }
}),

}


module.exports = userController;
