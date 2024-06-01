const asyncHandler = require("express-async-handler");
const { excludeFields } = require("../../utils/common.methods");
const User = require("../../model/user/user.model");
const Post = require("../../model/post/post.model");
const Category = require("../../model/category/category.model");
const { cloudUpload } = require("../../utils/cloudinary.utils");
require('fs').promises;

const postController = {

  // Create post
  createPost: asyncHandler(async (req, res) => {
    const { title, content, category, tags, status } = req.body;

    const categoryFound = await Category.findById(category);
    if (!categoryFound) {
      throw new Error("Category not found");
    }

    const userFound = await User.findById(req.auth_id);
    if (!userFound) {
      throw new Error("User not found");
    }

    let coverImgUrl;
    if (req.file && req.file.path) {
      const uploadResult = await cloudUpload(req.file.path);
      if (uploadResult.object && uploadResult.object.secure_url) {
        coverImgUrl = uploadResult.object.secure_url;
      } else {
        throw new Error('Failed to upload image to Cloudinary');
      }
    }
    const tagsArray = tags.split(',');

    const postCreated = await Post.create({
      title,
      content,
      category,
      author: req.auth_id,
      coverImgUrl,
      tags: tagsArray,
      status,
    });

    categoryFound.posts.push(postCreated._id);
    await categoryFound.save();

    userFound.posts.push(postCreated._id);
    userFound.updateAccountType();
    await userFound.save();

    return res.status(200).json({
      status: "success",
      message: 'Post created successfully',
      post: postCreated
    });
  }),


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

  fetchAllPosts: asyncHandler(async (req, res) => {
    const { category_id, title, page = 1, limit = 10 } = req.query;

    // Basic filter
    let filter = {};
    if (category_id) {
      filter.category_id = mongoose.Types.ObjectId(category_id);
    }
    if (title) {
      filter.title = { $regex: title, $options: "i" };
    }

    const allPosts = await Post.find({});
    const matchingPosts = await Post.find(filter);

    // Calculate the date two weeks ago
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    // Common pipeline stages
    const commonStages = [
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
          "status": 1
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit }
    ];

    // Aggregation for latest published posts
    const latestPublishedPostsArray = [
      {
        $match: {
          ...filter,
          status: "published",
          createdAt: { $gte: twoWeeksAgo }
        }
      },
      ...commonStages
    ];

    // Aggregation for trending published posts
    const trendingPublishedPostsArray = [
      {
        $match: {
          ...filter,
          status: "published",
          createdAt: { $gte: twoWeeksAgo },
          $expr: {
            $and: [
              { $gt: [{ $size: { $ifNull: ["$comments", []] } }, 5] },
              { $lte: [{ $size: { $ifNull: ["$likes", []] } }, 10] }
            ]
          }
        }
      },
      ...commonStages
    ];

    // Aggregation for draft posts
    const draftPostsArray = [
      {
        $match: {
          ...filter,
          status: "draft"
        }
      },
      ...commonStages
    ];

    // Execute aggregation queries
    const [latestPublishedPosts, trendingPublishedPosts, draftPosts, totalPosts, totalUsers] = await Promise.all([
      Post.aggregate(latestPublishedPostsArray),
      Post.aggregate(trendingPublishedPostsArray),
      Post.aggregate(draftPostsArray),
      Post.countDocuments(filter),
      User.countDocuments({})
    ]);

    res.json({
      status: "success",
      message: "Posts fetched successfully",
      latestPublishedPosts,
      trendingPublishedPosts,
      draftPosts,
      currentPage: page,
      perPage: limit,
      totalPages: Math.ceil(totalPosts / limit),
      totalUsers,
      totalPosts
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
      filter.content = { $regex: title, $options: "i" };
    }

    const posts = await Post.aggregate([
      { $match: filter },

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
          "title": "$title",
          "coverImgUrl": "$coverImgUrl",
          "content": "$content",
          "authorId": "$user._id",
          "authorEmail": "$user.email",
          "authorUsername": "$user.username",
          "authorProfilePic": "$user.profilePic",
          category_id: "$category_id",
          createdAt: "$createdAt",
          "tags": 1,
        }
      },

      {
        $sort: {
          createdAt: -1
        }
      },
      { $skip: (page - 1) * limit },
      { $limit: limit }

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
        {
          $project: {
            author: 1,
            likes: { $size: { $ifNull: ["$likes", []] } },
            comments: { $size: { $ifNull: ["$comments", []] } },
            viewers: { $size: { $ifNull: ["$viewers", []] } },
            tags: { $size: { $ifNull: ["$tags", []] } },
            coverImgUrl: 1,
            status: 1,
          }
        },
        // Group to calculate total counts
        {
          $group: {
            _id: "$author",
            totalPostLikes: { $sum: "$likes" },
            totalPosts: { $sum: 1 },
            totalComments: { $sum: "$comments" },
            totalViewers: { $sum: "$viewers" },
            tags: { $sum: "$tags" },
            published: {
              $sum: {
                // check if status is EQ to published 
                $cond: [{ $eq: ["$status", "published"] }, 1, 0]
              }
            },
            draft: {
              $sum: {
                $cond: [{ $eq: ["$status", "draft"] }, 1, 0]
              }
            },
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "authorDetails"
          }
        },
        {
          $unwind: {
            path: "$authorDetails",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            _id: 1,
            totalPostLikes: 1,
            totalPosts: 1,
            totalComments: 1,
            totalViewers: 1,
            tags: 1,
            published: 1,
            draft: 1,
            authorUsername: "$authorDetails.username"
          }
        }
      ];

      const postsPipeline = [
        { $match: { author: authorId } },
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
            "status": 1,
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
        totalViewers: 0,
        published: 0,
        draft: 0,
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

  // ! update post
  update: asyncHandler(async (req, res) => {
    const postId = req.params.postId;

    const postFound = await Post.findById(postId);
    if (!postFound) {
      throw new Error("Post not found");
    }

    const updateData = {
      title: req.body.title,
      content: req.body.content,
      category: req.body.category,
      tags: req.body.tags ? req.body.tags.split(',') : [],
      status: req.body.status
    };

    // Update the image URL if a new file is uploaded
    if (req.file) {
      updateData.coverImgUrl = req.file.path;
    }

    const postUpdated = await Post.findByIdAndUpdate(
      postId,
      updateData,
      { new: true }
    );
    res.json({
      status: "Post updated successfully",
      postUpdated,
    });
  }),

  // Like post
  like: asyncHandler(async (req, res) => {
    const postId = req.params.postId;
    const userId = req.auth_id;

    const updatedPost = await Post.findOneAndUpdate(
      { _id: postId },
      {
        $addToSet: { likes: userId },
        $pull: { dislikes: userId },
      },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json({ message: "Post liked", likes: updatedPost.likes, dislikes: updatedPost.dislikes });
  }),

  // Dislike post
  dislike: asyncHandler(async (req, res) => {
    const postId = req.params.postId;
    const userId = req.auth_id;

    const updatedPost = await Post.findOneAndUpdate(
      { _id: postId },
      {
        $addToSet: { dislikes: userId },
        $pull: { likes: userId },
      },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json({ message: "Post disliked", likes: updatedPost.likes, dislikes: updatedPost.dislikes });
  }),
};

module.exports = postController;