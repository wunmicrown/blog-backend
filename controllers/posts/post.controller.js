const asyncHandler = require("express-async-handler");
const User = require("../../model/user/user.model");
const { excludeFields } = require("../../utils/common.methods");
const { cloudDelete } = require("../../utils/cloudinary.utils");
require('fs').promises;

const postController ={

 //!Create post
 createPost: asyncHandler(async (req, res) => {}),
 uploads: asyncHandler(async (req, res) => {
  if (!req.file || Object.keys(req.file).length === 0) {
    return res.status(400).json({ message: 'No files were uploaded.' });
  }

  const user = await User.findById(req.auth_id);
  console.log("User:", user);
  const oldPic = user.profilePic ?? null;
  if (oldPic) {
    // Below for cloudinary deletion
    let id = oldPic.split('/').pop().split('.')[0];
    const { status, error } = await cloudDelete(id);
    if (!status) {
      console.log(error);
      return res.status(500).json({ message: 'Failed to delete old image.' });
    }
  }

  // Using (multer-storage-cloudinary) i.e not pre-saving file to local disk
  user.profilePic = req.file.path;
  await user.save(); // Await the save operation

  const _user = excludeFields(user.toObject(), ["otp", "password", "__v"]);
  return res.status(200).json({ message: 'Image uploaded successfully', user: _user });
}),


};


module.exports = postController;

