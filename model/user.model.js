const mongoose = require('mongoose')
require('dotenv').config()
const bcrypt = require('bcrypt')

const URI = process.env.MONGODB_URI
console.log(URI);
mongoose.connect(URI)
    .then(() => {
        console.log(`connected to database sucessfully`);
    }).catch((err) => {
        console.log(`error while connecting to database ${err}`);
    })

let userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: { type: String, required: true, default: false },
    otp: { type: Number, unique: true },
    emailVerified: { type: Boolean, default: false },
    password: { type: String, require: true },
    profilePic: String,
})

userSchema.pre('save', async function (next) {
    try {
        const hash = await bcrypt.hash(this.password, 10);
        this.password = hash;
        next();
    } catch (error) {
        next(error);
    }
});


let User = mongoose.model('User', userSchema)


module.exports = User
