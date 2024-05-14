const asyncHandler = require("express-async-handler");
const { excludeFields } = require("../../utils/common.methods");
const User = require("../../model/user/user.model");
const Post = require("../../model/post/post.model");
const Category = require("../../model/category/category.model");
const { cloudUpload } = require("../../utils/cloudinary.utils");
const { default: mongoose } = require("mongoose");
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
    const { category_id, title, page = 1, limit = 10 } = req.query;
    // Basic filter
    let filter = {};
    if (category_id) {
      filter.category_id = category_id;
    }
    if (title) {
      filter.content = { $regex: title, $options: "i" };
    }

    // Calculate the date two weeks ago
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    // Aggregation for latest posts
    const latestPostsArray= [
      {
        $match: filter
      },
      {
        $match: {
          createdAt: { $gte: twoWeeksAgo }
        }
      },
      // Fetch posts created within the last two weeks
      {
        $lookup: {
          from: "users",
          localField: "author", 
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          "_id": 0,
          "id": "$_id",
          "title": 1,
          "coverImgUrl": 1,
          "content": 1,
          "authorId": "$user._id",
          "authorEmail": "$user.email",
          "authorUsername": "$user.username",
          "authorProfilePic": "$user.profilePic",
          "category_id": 1,
          "createdAt": 1,
          "tags": 1,
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit }
    ];

    // Aggregation for trending posts
    const trendingPostsArray = [
      { $match: filter }, // Apply existing filters
      {
        $match: {
          createdAt: { $gte: twoWeeksAgo },
          $expr: { $gt: [{ $size: { $ifNull: ["$comments", []] } }, 4] } // Check if the size of the comments array is greater than 5
        }
      },

      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          "_id": 0,
          "id": "$_id",
          "title": 1,
          "coverImgUrl": 1,
          "content": 1,
          "authorId": "$user._id",
          "authorEmail": "$user.email",
          "authorUsername": "$user.username",
          "authorProfilePic": "$user.profilePic",
          "category_id": 1,
          "createdAt": 1,
          "tags": 1,
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit }
    ];

    // Execute aggregation queries
    const [latestPosts, trendingPosts] = await Promise.all([
      Post.aggregate(latestPostsArray),
      Post.aggregate(trendingPostsArray)
    ]);

    // Total posts
    const totalPosts = await Post.countDocuments(filter);

    // Send response to the client
    res.json({
      status: "success",
      message: "Posts fetched successfully",
      latestPosts,
      trendingPosts,
      currentPage: page,
      perPage: limit,
      totalPages: Math.ceil(totalPosts / limit)
    });
  }),

  AllPosts: asyncHandler(async (req, res) => {
    const { category_id, title, page = 1, limit = 300 } = req.query;
    // Basic filter
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

    ]);
    // Define a function to get user post statistics
    const getUserPostStats = async (auth_id) => {
      const stats = await Post.aggregate([
        // Match posts by user ID
        { $match: { author: auth_id } },
        // Project necessary fields
        {
          $project: {
            "likes": { $size: { $ifNull: ["$likes", []] } },
            "comments": { $size: { $ifNull: ["$comments", []] } },
            "viewers": { $size: { $ifNull: ["$viewers", []] } }
          }
        },
        // Group to calculate total counts
        {
          $group: {
            _id: null,
            totalPostLikes: { $sum: "$likes" },
            totalPosts: { $sum: 1 },
            totalComments: { $sum: "$comments" },
            totalViewers: { $sum: "$viewers" }
          }
        }
      ]);
    
      // Extract the stats or return defaults if no stats found
      if (stats.length > 0) {
        return {
          totalPostLikes: stats[0].totalPostLikes,
          totalPosts: stats[0].totalPosts,
          totalComments: stats[0].totalComments,
          totalViewers: stats[0].totalViewers
        };
      } else {
        return {
          totalPostLikes: 0,
          totalPosts: 0,
          totalComments: 0,
          totalViewers: 0
        };
      }
    };
    

    // Iterate over posts to get statistics for each user
for (const post of posts) {
  const userStats = await getUserPostStats(req.auth_id);
  // Assign user statistics to the post
  post.userStats = userStats;
}

    // Total posts
    const totalPosts = await Post.countDocuments(filter);

    // Send response
    res.json({
      status: "success",
      message: "Post fetched successfully",
      posts,
      currentPage: page,
      perPage: limit,
      totalPages: Math.ceil(totalPosts / limit),
    });
}),

getUserPostStats: asyncHandler(async (req, res) => {
  try {
    const authorId = req.auth_id;

    const userStatsPipeline = [
      // Match posts by author ID
      { $match: { author: authorId } },
      // Project necessary fields and calculate sizes
      {
        $project: {
          author: 1,
          likes: { $size: { $ifNull: ["$likes", []] } },
          comments: { $size: { $ifNull: ["$comments", []] } },
          viewers: { $size: { $ifNull: ["$viewers", []] } },
          coverImgUrl:1,
        }
      },
      // Group to calculate total counts
      {
        $group: {
          _id: "$author",
          totalPostLikes: { $sum: "$likes" },
          totalPosts: { $sum: 1 },
          totalComments: { $sum: "$comments" },
          totalViewers: { $sum: "$viewers" }
        }
      }
    ];

    const postsPipeline = [
      // Match posts by author ID
      { $match: { author: authorId } },
      // Project necessary fields for posts
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          "_id": 0,
          "id": "$_id",
          "title": 1,
          "content": 1,
          "createdAt": 1,
          "category": 1,
          "tags": 1,
          "coverImgUrl": 1,
          "authorId": "$user._id",
          "authorUsername": "$user.username",
        }
      }
    ];

    // Execute both pipelines concurrently
    const [userStats, posts] = await Promise.all([
      Post.aggregate(userStatsPipeline),
      Post.aggregate(postsPipeline)
    ]);

    // Extract the stats or return defaults if no stats found
    const userStatsResult = userStats.length > 0 ? userStats[0] : {
      totalPostLikes: 0,
      totalPosts: 0,
      totalComments: 0,
      totalViewers: 0
    };

    res.json({
      status: "success",
      message: "User post statistics fetched successfully",
      userStats: userStatsResult,
      posts: posts
    });
  } catch (error) {
    console.error("Error fetching user post statistics:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}),



  // AllPosts: asyncHandler(async (req, res) => {
  //   const { category_id, title, page = 1, limit = 300 } = req.query;
  //   // Basic filter
  //   let filter = {};
  //   if (category_id) {
  //     filter.category_id = category_id;
  //   }
  //   if (title) {
  //     filter.content = { $regex: title, $options: "i" }; 
  //   }

  //   const posts = await Post.aggregate([
  //     { $match: filter },
    
  //     {
  //       $lookup:{
  //         from: "users",
  //         localField: "author",
  //         foreignField: "_id",
  //         as: "author"
  //       }
  //     },
  //     { $unwind:{
  //       path:"$author",
  //       preserveNullAndEmptyArrays: true
  //     }},
      
  //     {
  //       $project: {
  //         "_id": 0,
  //         "id": "$_id",
  //         "title": 1,
  //         "coverImgUrl": 1,
  //         "content": 1,
  //         "authorId": "$author._id",
  //         "authorEmail": "$author.email",
  //         "authorUsername": "$author.username",
  //         "authorProfilePic": "$author.profilePic",
  //         "category_id": 1,
  //         "createdAt": 1,
  //         "tags": 1,
  //         "comments":1,
  //         "likes": { $size: { $ifNull: ["$likes", []] } }
  //       }
  //     },
    
  //     { $sort:{ createdAt:-1 } },
  //     { $skip: (page - 1) * limit },
  //     { $limit: limit },
    
  //     {
  //       $group: {
  //         _id: null,
  //         totalPostLikes: { $sum: "$likes" },
  //         totalPosts: { $sum: 1 },
  //         totalComments: { $sum: { $size: { $ifNull: ["$comments", []] } } },
  //         totalViewers: { $sum: { $size: { $ifNull: ["$author.viewers", []] } } }
  //       }
  //     }
  //   ]);
    

  //   console.log(posts);
  //   // Total posts
  //   const totalPosts = await Post.countDocuments(filter);

  //   res.json({
  //     status: "success",
  //     message: "Post fetched successfully",
  //     posts,
  //     totalPosts,
  //     currentPage: page,
  //     perPage: limit,
  //     totalPages: Math.ceil(totalPosts / limit),
  //   });
  // }),


  // ! delete posts
  delete: asyncHandler(async (req, res) => {
    try {
      //get the post id from params
    const postId = req.params.postId;
    const post=await Post.findById(postId)    
    if(!post){
      return res.status(404).json({
        status: "fail",
        message: "Post not found",
      })
    }
     // Check if the logged-in user is the author of the post
     if (post.author !== req.auth_id) {
      return res.status(403).json({
          status: "error",
          message: "You are not authorized to delete this post",
      });
  }
    //find the post
    await Post.findByIdAndDelete(postId);
    res.json({
      status: "success",
      message: "Post deleted successfully",
    });
    } catch (error) {

  }
  }),
  
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
    // console.log("postId:", postId)
    //find the post
    const postFound = await Post.findById(postId);
    // console.log("postFound:", postFound)
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
    //send the response
    res.json({
      message: "Post Disliked",
    });
  }),
};

module.exports = postController;