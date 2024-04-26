const mongoose = require('mongoose')
require('dotenv').config()
const bcrypt = require('bcrypt')

// const URI = process.env.TEST_MONGODB_URI
// console.log(URI);
// mongoose.connect(URI)
//     .then(() => {
//         console.log(`connected to database sucessfully`);
//     }).catch((err) => {
//         console.log(`error while connecting to database ${err}`);
//     })

let userSchema = new mongoose.Schema(
    {
        // Basic user information

        username: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: false,
            unique: true
        },
        isEmailVerified: {
            type: Boolean,
            default: false
        },
        password: {
            type: String,
            require: true
        },
        otp: {
            type: Number,
            required: false,
            unique: true
        },
        userType: {
            type: String,
            default: "User",
            enum: ["User", "Admin"],
        },

        isActive: {
            type: Boolean,
            default: true
        },
        isBlocked: {
            type: Boolean,
            default: false
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        },
        profilePic: {
            type: String,
            default: null
        },
        posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],

        //Account type
        accountType: {
            type: String,
            default: "Basic",
        },
        // User relationships
        followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Link to other users
        following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
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

//Method to update user accountType
userSchema.methods.updateAccountType = () => {
    userSchema.methods.updateAccountType = function () {
        //get the total posts
        const postCount = this.posts.length;
        if (postCount >= 50) {
            this.accountType = "Premium";
        } else if (postCount >= 10) {
            this.accountType = "Standard";
        } else {
            this.accountType = "Basic";
        }
    };

};

let User = mongoose.model('User', userSchema)


module.exports = User
