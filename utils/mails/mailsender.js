const nodemailer = require("nodemailer");
const User = require("../../model/user/user.model");
const { otpEmailTemplate, } = require("../otpTemplate");

// global varibale for genarating OTP
const generateSixDigitNumber = () => {
    return Math.floor(Math.random() * 900000) + 100000;
  };
  
/***
 * 
 */
const sendOtpEmail = async (email, username) => {
    try {
    // Generate an OTP for email verification
    const otpGen =generateSixDigitNumber()
    // Create SMTP transporter
      let transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: 465,
        secure: true,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      });
  
      // Email messege
      const mailOptions = {
        from: `"Blogify" ${process.env.MAIL_USER}`,
        to: email,
        subject: "OTP Verification",
        html: otpEmailTemplate(username, otpGen)
    };

    //   Send email
    await transporter.sendMail(mailOptions);
      // Save OTP in database
      await User.updateOne({ email: email }, { $set: { otp: otpGen } });
  
      return otpGen;
    } catch (error) {
      console.error("Error sending OTP:", error);
      throw new Error("Error sending OTP");
    }
  };

  module.exports = {
    sendOtpEmail,
    
  }
  
 
 