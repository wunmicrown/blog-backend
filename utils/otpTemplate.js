const otpEmailTemplate = (username, otpGen) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
    </head>
    <body>
    <div style="justify-content: center; font-family: Arial, Helvetica, sans-serif;">
    <h1 style="color: #3F6CCE;">Blog app</h1>
    <p style=" font-weight: 500;">Dear ${username},</p>

    <p style=" font-weight: 300;">
      Thank you for registering with our<span style="color: #3F6CCE;"> Blog app </span>app. 
      Please use the following OTP to verify your email address:
    </p>
    <h2>${otpGen}</h2>

    <p>Thanks and kind regards.</p>
    </div>
      
        
    </body>
    </html>
    `
}
const resendOtpTemplate = (username, otpGen) => {
  return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
      </head>
      <body>
          <div style="justify-content: center; font-family: Arial, Helvetica, sans-serif;">
              <h1 style="color: #3F6CCE;">Blog app</h1>
              <p style=" font-weight: 500;">Dear ${username},</p>

              <p style=" font-weight: 300;">
                  We noticed that you haven't verified your email address with our<span style="color: #3F6CCE;"> Blog app </span>app yet.
                  Please use the following OTP to complete your email verification process:
              </p>
              <h2>${otpGen}</h2>

              <p>If you didn't request this OTP, please ignore this email.</p>

              <p>Thanks and kind regards.</p>
          </div>
      </body>
      </html>
  `;
};

const resetPasswordOtpTemplate = (username, otpGen) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
    </head>
    <body>
    <div style="justify-content: center; font-family: Arial, Helvetica, sans-serif;">
    <h1 style="color: #3F6CCE;">Blog app</h1>
    <p style=" font-weight: 500;">Dear ${username},</p>

    <p style=" font-weight: 300;">
      Thank you for registering with our <span style="color: #3F6CCE;">Blog</span> app.
      Please use the following OTP to reset your password:
    </p>
    <h2>${otpGen}</h2>

    <p>Thanks and kind regards.</p>
    </div>
      
        
    </body>
    </html>
    `
}
const changedEmailTemplate = (username, otp) => {
  return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
      </head>
      <body>
        <div style="justify-content: center; font-family: Arial, Helvetica, sans-serif;">
          <h1 style="color: #3F6CCE;">Blog App</h1>
          <p style="font-weight: 500;">Dear ${username},</p>
  
          <p style="font-weight: 300;">
            Your email address has been successfully changed for our
            <span style="color: #3F6CCE;">Blog</span> app.
            Please use the following OTP to verify your new email address:
          </p>
          <h2>${otp}</h2>
  
          <p>Thanks and kind regards.</p>
        </div>
      </body>
      </html>
    `;
};

module.exports = {
  otpEmailTemplate,
  resetPasswordOtpTemplate,
  changedEmailTemplate,
  resendOtpTemplate
};

