const otpEmailTemplate=(username, otp)=>{
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
      Thank you for registering with our<span style="color: #3F6CCE;">Blog app </span>app. 
      Please use the following OTP to verify your email address:
    </p>
    <h2>${otp}</h2>

    <p>Thanks and kind regards.</p>
    </div>
      
        
    </body>
    </html>
    `
  }

  module.exports = {
    otpEmailTemplate
  };