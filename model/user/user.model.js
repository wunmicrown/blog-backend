const mongoose = require('mongoose')
require('dotenv').config()
const bcrypt = require('bcrypt')

const URI = process.env.MONGODB_URI;

mongoose.connect(URI)
  .then(() => {
    console.log(`Connected to database successfully`);
  }).catch((err) => {
    console.log(`Error while connecting to database ${err}`);
  });

let userSchema = new mongoose.Schema(
    {
        // Basic user information
        name: {
            type: String,
            required: true,
        },
        username: {
            type: String,
            required: true,
            unique: true
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
