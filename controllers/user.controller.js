'use strict'
const User= require('../model/user.model');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const { excludeFields } = require('../utils/common.methods');


const signup = async(req,res)=>{
    try {
        const {email}=req.body;
        console.log({emailBody:email});

        const userExists = await User.findOne({ email });
        if (userExists) {
          return res.status(409).send("User already exists");
        }

        if (req.body.password) {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            req.body.password = hashedPassword;
            console.log(hashedPassword);
          }

          let newUser = new User(req.body);
        //   newUser =excludeFields(User.toObject(),['password', '__v'])
          console.log("newUser:", newUser);
          await newUser.save();
          return res.status(200).json({messege:'Signup successful', user:newUser});

    } catch (err) {
        console.error("Error during signup:", err);
        // return res.status(401).send('Bad request');

    }               
    // return res.status(200).send('signup route is working now ');

}



module.exports = {
    signup

};

































































