'use strict'
const User= require('../model/user.model');
const bcrypt = require('bcrypt');

const signup = async(req,res)=>{
    try {
        const {email}=req.body;
        console.log({email});

        const userExists = await User.findOne({ email });
        if (userExists) {
          return res.status(409).send("User already exists");
        }

        if (req.body.password) {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            req.body.password = hashedPassword;
            console.log(hashedPassword);
          }

          const newUser = new User(req.body);
          console.log(newUser);
          await newUser.save();
          return res.status(200).send('Signup successful');

    } catch (err) {
        console.error("Error during signup:", err);
        // return res.status(401).send('Bad request');

    }               
    // return res.status(200).send('signup route is working now ');

}



module.exports = {
    signup

};