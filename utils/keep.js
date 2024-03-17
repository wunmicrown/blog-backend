 // const User = require('../model/user.model');
// const bcrypt = require('bcrypt');
// const nodemailer = require('nodemailer');
// const otpGenerator = require('otp-generator');
// const { otpEmailTemplate } = require('../utils/otpTemplate');

// require('dotenv').config();

// const transporter = nodemailer.createTransport({
//     service: 'Gmail',
//     auth: {
//         user: process.env.MAIL_USER,
//         pass: process.env.MAIL_PASS,
//     }
// });

// // global varibale for genarating OTP
// const generateSixDigitNumber = () => {
//     return Math.floor(Math.random() * 900000) + 100000;
// };

// /**
//  * Registers a new user by saving their details (including OTP) to the database and sending a verification email.
//  * 
//  * @param {Object} req - The request object containing user details in the body.
//  * @param {Object} res - The response object to send back to the client.
//  * @returns {Promise<void>} - A promise that resolves once the registration process is complete.
//  */
// const signup = async (req, res) => {
//     try {
//         const { email } = req.body;
//         console.log({ email });

//         const userExists = await User.findOne({ email });
//         if (userExists) {
//             return res.status(409).send("User already exists");
//         }

//         if (req.body.password) {
//             const hashedPassword = await bcrypt.hash(req.body.password, 10);
//             req.body.password = hashedPassword;
//             console.log(hashedPassword);
//         }

//         const otpGen = generateSixDigitNumber();

//         const newUser = new User({
//             ...req.body,
//         });
//         console.log(newUser);

//         // Sending OTP to the user's email
//         const mailOptions = {
//             from: process.env.MAIL_USER,
//             to: email,
//             subject: 'Verify Your Email',
//             html: otpEmailTemplate(newUser.firstName, otpGen)
//         };

//         transporter.sendMail(mailOptions, function (error, info) {
//             if (error) {
//                 console.log(error);
//                 res.status(500).send("Failed to send verification email");
//             } else {
//                 console.log('Email sent: ' + info.response);
//                 // Save the user to the database after sending the email
//                 newUser.save()
//                     .then(() => {
//                         res.status(200).send('Signup successful');
//                     })
//                     .catch(err => {
//                         console.error("Error saving user:", err);
//                         res.status(500).send("Failed to save user");
//                     });
//             }
//         });
//     } catch (err) {
//         console.error("Error during signup:", err);
//         // res.status(500).send("Internal server error");
//     }
// };

// module.exports = {
//     signup
// };
