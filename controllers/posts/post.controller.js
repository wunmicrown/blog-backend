const asyncHandler = require("express-async-handler");
const User = require("../../model/user/user.model");
const { excludeFields } = require("../../utils/common.methods");
const { cloudDelete } = require("../../utils/cloudinary.utils");
require('fs').promises;

const postController ={

 //!Create post
 createPost: asyncHandler(async (req, res) => {}),
 uploads:asyncHandler(async (req, res) => {
    try {
        //req.file for single file : req.files for multiple files [array of object]
        if (!req.file || Object.keys(req.file).length === 0) {
          return res.status(400).json({ message: 'No files were uploaded.' });
        }
    
        const user = await User.findById(req.auth_id);
        console.log("User:",user);
        oldPic = user.profilePic ?? null;
        if (oldPic) {
    
          // Below for cloudinary deletion
          let id = oldPic.split('/').pop().split('.')[0];
          const { status, error } = await cloudDelete(id);
          if (!status) console.log(error);
        }
    
        // Using (multer-storage-cloudinary) i.e not pre-saving file to local disk
        user.profilePic = req.file.path;
        user.save();
        const _user = excludeFields(user.toObject(), ["otp", "password", "__v"])
        return res.status(200).json({ user: _user })
    
      } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
      }
 }),

};


module.exports = postController;

