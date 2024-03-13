const mongoose = require('mongoose')
require('dotenv').config()
const bcrypt = require('bcrypt')
const URI = process.env.MONGODB_URI

mongoose.connect(URI)
    .then(() => {
        console.log(`connected to database sucessfully`);
    }).catch((err) => {
        console.log(`error while connecting to database ${err}`);
    })

let userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: { type: String, require: true, default: false },
    emailVerified: { type: Boolean, default: false },
    password: { type: String, require: true },
    profilePic: { type: String },
})

userSchema.pre('save', async function (next) {
    bcrypt.hash(this.password, 10, (err, hash) => {
        console.log(hash);
        this.password = hash;
        next();
    })
})

let user = mongoose.model('user', userSchema)


module.exports = {
    user
};