const asyncHandler = require("express-async-handler");
const { excludeFields } = require("../../utils/common.methods");
const User = require("../../model/user/user.model");
const Post = require("../../model/post/post.model");
const Category = require("../../model/category/category.model");
const { cloudUpload } = require("../../utils/cloudinary.utils");
require('fs').promises;

const postController = {
  
  // Create post
  // createPost: asyncHandler(async (req, res) => {

  //   // Get the payload
  //   const { title, content, category,tags } = req.body;
  // console.log(req.body);
  //   // Find the category
  //   const categoryFound = await Category.findById(category);
  //   if (!categoryFound) {
  //     throw new Error("Category not found");
  //   }

  //   // Find the user
  //   const userFound = await User.findById(req.auth_id);
  //   if (!userFound) {
  //     throw new Error("User not found");
  //   }

  //   // Check if an image file is uploaded
  //   let coverImgUrl;
  //   if (req.file && req.file.path) {
  //     // Use Cloudinary uploader to upload the image to the cloud
  //     const uploadResult = await cloudUpload(req.file.path);
  //     if (uploadResult.object && uploadResult.object.secure_url) {
  //       // If upload was successful, use the secure URL of the uploaded image
  //       coverImgUrl = uploadResult.object.secure_url;
  //     } else {
  //       // If upload failed, handle the error
  //       throw new Error('Failed to upload image to Cloudinary');
  //     }
  //   }
  //   const tagsArray = tags.split(',');

  //   // Create the post with timestamp
  //   const postCreated = await Post.create({
  //     title,
  //     content,
  //     category,
  //     author: req.auth_id,
  //     coverImgUrl,
  //     createdAt: new Date(),
  //     tags: tagsArray
  //   });

  //   // Push the post ID into the category's posts array
  //   categoryFound.posts.push(postCreated._id);
  //   await categoryFound.save();

  //   // Push the post ID into the user's posts array
  //   userFound.posts.push(postCreated._id);
  //   userFound.updateAccountType();
  //   await userFound.save();

  //   // Send the post data along with timestamp to the client
  //   return res.status(200).json({
  //     status: "success",
  //     message: 'Post created successfully',
  //     post: postCreated
  //   });
  // }),
  createPost: asyncHandler(async (req, res) => {
    // Get the payload
    const { title, content, category, tags } = req.body;

    // Find the category
    const categoryFound = await Category.findById(category);
    if (!categoryFound) {
      throw new Error("Category not found");
    }

    // Find the user
    const userFound = await User.findById(req.auth_id);
    if (!userFound) {
      throw new Error("User not found");
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
    const tagsArray = tags.split(',');

    // Create the post with timestamp and draft set to false
    const postCreated = await Post.create({
      title,
      content,
      category,
      author: req.auth_id,
      coverImgUrl,
      createdAt: new Date(),
      tags: tagsArray,
      draft: false, // Set draft to false
    });

    // Push the post ID into the category's posts array
    categoryFound.posts.push(postCreated._id);
    await categoryFound.save();

    // Push the post ID into the user's posts array
    userFound.posts.push(postCreated._id);
    userFound.updateAccountType();
    await userFound.save();

    // Send the post data along with timestamp to the client
    return res.status(200).json({
      status: "success",
      message: 'Post created successfully',
      post: postCreated
    });
  }),
  


  // Fetch post details by postId
  
  fetchPostDetails: asyncHandler(async (req, res) => {
    try {
      const { postId } = req.params;
      console.log("postId", postId)
      let post = await Post.findById(postId)
        .populate("author")
        .populate("category_id")
        .select(+{ timestamp: true });

      // Check if post exists
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      // Exclude sensitive fields from the author object
      post.author = excludeFields(post.author.toObject(), ["otp", "password", "__v"]);

      // Send the response with modified post object
      res.status(200).json({ post });
    } catch (error) {
      console.error("Error fetching post details:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }),


  //!list all posts
  fetchAllPosts: asyncHandler(async (req, res) => {
    const { category_id, title, page = 1, limit = 300 } = req.query;
    //Basic filter
    let filter = {};
    if (category_id) {
      filter.category_id = category_id;
    }
    if (title) {
      filter.content = { $regex: title, $options: "i" }; //case insensitive
    }

    const posts = await Post.aggregate([
      {$match: filter},

      {$lookup:{
        from: "users",
        localField: "author",
        foreignField: "_id",
        as: "user"
      }},

      {$unwind:{
        path:"$user",
        preserveNullAndEmptyArrays: true
      }},

      {$project:{
        "_id":0,
        "id":"$_id",
        "title":"$title",
        "coverImgUrl":"$coverImgUrl",
        "content":"$content",
        "authorId":"$user._id",
        "authorEmail":"$user.email",
        "authorUsername":"$user.username",
        "authorProfilePic":"$user.profilePic",
        category_id:"$category_id",
        createdAt:"$createdAt",
        "tags":1,
      }},

      {$sort:{
        createdAt:-1
      }},
      {$skip: (page - 1) * limit},
      {$limit: limit}

    ])
     
    //total posts
    const totalPosts = await Post.countDocuments(filter);
    res.json({
      status: "success",
      message: "Post fetched successfully",
      posts,
      currentPage: page,
      perPage: limit,
      totalPages: Math.ceil(totalPosts / limit),
    });
  }),
  // List all posts with user likes and dislikes count using aggregation
  


  //! delete posts
  delete: asyncHandler(async (req, res) => {
    //get the post id from params
    const postId = req.params.postId;
    //find the post
    await Post.findByIdAndDelete(postId);
    res.json({
      status: "success",
      message: "Post deleted successfully",
    });
  }),
  //! update post
  update: asyncHandler(async (req, res) => {
    //get the post id from params
    const postId = req.params.postId;
    console.log("postId:", postId)
    //find the post
    const postFound = await Post.findById(postId);
    console.log("postFound:", postFound)
    //check if post exists
    if (!postFound) {
      throw new Error("Post  not found");
    }
    //update
    const postUpdted = await Post.findByIdAndUpdate(
      postId,
      { content: req.body.content, image: req.file },
      {
        new: true,
      }
    );
    res.json({
      status: "Post updated successfully",
      postUpdted,
    });
  }),

  //like post
  like: asyncHandler(async (req, res) => {
    //Post id
    const postId = req.params.postId;
    //user liking a post
    const userId = req.auth_id;
    //Find the post
    const post = await Post.findById(postId);
    //Check if a user has already disliked the post
    if (post?.dislikes.includes(userId)) {
      post?.dislikes?.pull(userId);
    }
    //Check if a user has already liked the post
    if (post?.likes.includes(userId)) {
      post?.likes?.pull(userId);
    } else {
      post?.likes?.push(userId);
    }
    //resave the post
    await post.save();
    //send the response
    res.json({
      message: "Post Liked",
    });


  }),

  //like post
  dislike: asyncHandler(async (req, res) => {
    //Post id
    const postId = req.params.postId;
    //user liking a post
    const userId = req.auth_id;
    console.log(userId)
    //Find the post
    const post = await Post.findById(postId);
    //Check if a user has already liked the post
    if (post?.likes.includes(userId)) {
      post?.likes?.pull(userId);
    }
    //Check if a user has already disliked the post
    if (post?.dislikes.includes(userId)) {
      post?.dislikes?.pull(userId);
    } else {
      post?.dislikes?.push(userId);
    }
    //resave the post
    await post.save();
    console.log(post.save())
    //send the response
    res.json({
      message: "Post Disliked",
    });
  }),
};

module.exports = postController;