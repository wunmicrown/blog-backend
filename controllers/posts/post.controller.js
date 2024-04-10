const asyncHandler = require("express-async-handler");
const { excludeFields } = require("../../utils/common.methods");
const User = require("../../model/user/user.model");
const Post = require("../../model/post/post.model");
const Category = require("../../model/category/category.model");
const { cloudUpload, cloudDelete } = require("../../utils/cloudinary.utils");
require('fs').promises;

const postController = {

  //!Create post
  createPost: asyncHandler(async (req, res) => {
    //get the payload
    const { title, content, category } = req.body;
    console.log("title:", title, "content:", content, "category:", category);
    // find the category
    const categoryFound = await Category.findById(category);
    if (!categoryFound) {
      throw new Error("Category not found");
    }
    //  // find the user
    const userFound = await User.findById(req.auth_id);
    console.log("userFound:", userFound);
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
      author: req.auth_id,
      coverImgUrl,
    })
    console.log("postCreated", postCreated)
    // the post was pushed into category
    categoryFound.posts.push(categoryFound?._id);
    console.log("categoryFound", categoryFound.posts.push(categoryFound?._id))
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
  

   // Fetch post details by postId
   fetchPostDetails: asyncHandler(async (req, res) => {
    try {
      const { postId } = req.params;
      console.log("postId", postId)
      let post = await Post.findById(postId)
        .populate("author")
        .populate("category_id")
        .select(+{ timestamp: true }); // Include createdAt and updatedAt fields
  
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

    const posts = await Post.find(filter)
      .populate("category_id")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    //total posts
    const totalPosts = await Post.countDocuments(filter);
    res.json({
      status: "success",
      message: "Post fetched successfully",
      posts,
      currentPage: page,
      perPage: limit,
      totalPages: Math.ceil(totalPosts / limit),
      // author: userFound.username,
    });
  }),

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

