const asyncHandler = require("express-async-handler");
const { excludeFields } = require("../../utils/common.methods");
const { cloudDelete } = require("../../utils/cloudinary.utils");
const User = require("../../model/user/user.model");
const Post = require("../../model/post/post.model");
const Category = require("../../model/category/category.model");
require('fs').promises;

const postController ={

 //!Create post
 createPost: asyncHandler(async (req, res) => {
    //get the payload
  const { title, description,category } = req.body;
  console.log("title:",title, "description:",description, "category:",category);
  // find the category
  const categoryFound = await Category.findById(category);
  if (!categoryFound) {
    throw new Error("Category not found");
  }
   // find the user
   const userFound = await User.findById(req.user);
   if (!userFound) {
     throw new Error("User not found");
   }

  // create the post
  const postCreated = await Post.create({
    title,
    description,
    category,
    image: req.file.path,
  })

   // the post was pushed into category
   categoryFound.posts.push(categoryFound?._id);
   //resave the category
   await categoryFound.save();
   //push the posts into user
   userFound.posts.push(postCreated?._id);
   //Update the user account type
   userFound.updateAccountType();
   //save the user
   await userFound.save();
   //send the post to the client
   return res.status(200).json({status: "success", message: 'Post created successfully', post: postCreated });
 }),


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

