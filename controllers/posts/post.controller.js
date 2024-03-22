const asyncHandler = require("express-async-handler");
const { excludeFields } = require("../../utils/common.methods");
const User = require("../../model/user/user.model");
const Post = require("../../model/post/post.model");
const Category = require("../../model/category/category.model");
const { cloudUpload, cloudDelete } = require("../../utils/cloudinary.utils");
require('fs').promises;

const postController ={

 //!Create post
 createPost: asyncHandler(async (req, res) => {
    //get the payload
  const { title, content,category } = req.body;
  console.log("title:",title, "content:",content, "category:",category);
  // find the category
  const categoryFound = await Category.findById(category);
  if (!categoryFound) {
    throw new Error("Category not found");
  }
  //  // find the user
   const userFound = await User.findById(req.auth_id);
   console.log("userFound:",userFound);
   if (!userFound) {
     throw new Error("User not found");
   }

     // Check if the user already has a cover image
     let oldCoverImgUrl = null;
     if (userFound.coverImgUrl) {
       oldCoverImgUrl = userFound.coverImgUrl;
 
       // Below for cloudinary deletion of old cover image
       let id = oldCoverImgUrl.split("/").pop().split(".")[0];
       const { status, error } = await cloudDelete(id);
       if (!status) {
         console.log(error);
         return res.status(500).json({ message: "Failed to delete old cover image." });
       }
     }

     // Check if an image file is uploaded
     let coverImgUrl;
     if (req.file && req.file.path) {
       // Use Cloudinary uploader to upload the image to the cloud
       const uploadResult = await cloudUpload(req.file.path);
       if (uploadResult.object && uploadResult.object.secure_url) {
         // If upload was successful, use the secure URL of the uploaded image
         coverImgUrl = uploadResult.object.secure_url;
       } else {
         // If upload failed, handle the error
         throw new Error('Failed to upload image to Cloudinary');
       }
     }
 
  // create the post
  const postCreated = await Post.create({
    title,
    content,
    category,
    author:req.auth_id,
    coverImgUrl,
  })
console.log("postCreated",postCreated)
   // the post was pushed into category
   categoryFound.posts.push(categoryFound?._id);
   console.log("categoryFound",categoryFound.posts.push(categoryFound?._id))
   //resave the category
   await categoryFound.save();
   //push the posts into user
   userFound.posts.push(postCreated?._id);
   //Update the user account type
   userFound.updateAccountType();
   //save the user
   await userFound.save();
   //send the post to the client
   return res.status(200).json({
    status: "success", message: 'Post created successfully', post: postCreated,
    // author: userFound.username,
  });
 }),

 
};


module.exports = postController;

