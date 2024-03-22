const asyncHandler = require("express-async-handler");
const { excludeFields } = require("../../utils/common.methods");
const User = require("../../model/user/user.model");
const Post = require("../../model/post/post.model");
const Category = require("../../model/category/category.model");
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
  
  // create the post
  const postCreated = await Post.create({
    title,
    content,
    category,
    author:req.auth_id,
    imagecoverImgUrl:req.file.path,
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
   return res.status(200).json({status: "success", message: 'Post created successfully', post: postCreated });
 }),
};


module.exports = postController;

