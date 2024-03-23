const nodemailer = require("nodemailer");
const User = require("../../model/user/user.model");
const { resetPasswordOtpTemplate } = require("../otpTemplate");

// global varibale for genarating OTP
const generateSixDigitNumber = () => {
    return Math.floor(Math.random() * 900000) + 100000;
};


const resetEmailOtp = async (email, username) => {
    try {
        if (!email) {
            throw new Error("No email address provided");
        }

        // Generate an OTP for email verification
        const otpGen = generateSixDigitNumber();

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

        // Email message
        const mailOptions = {
            from: `"Blogify" ${process.env.MAIL_USER}`,
            to: email, // Ensure email address is defined
            subject: "OTP Verification",
            html: resetPasswordOtpTemplate(username, otpGen)
        };

        // Send email
        await transporter.sendMail(mailOptions);

        // Save OTP in database
        await User.updateOne({ email: email }, { $set: { otp: otpGen } });

        return otpGen;
    } catch (error) {
        console.error("Error sending OTP:", error);
        throw new Error("Error sending OTP");
    }
};


module.exports = { resetEmailOtp };