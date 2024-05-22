const request = require("supertest");
const app = require("../index");
const mongoose = require("mongoose");
const Category = require("../models/category.model");
require('dotenv').config()

const URI = process.env.MONGODB_URI;

// Mocking MongoDB connection
beforeAll(async () => {
  await mongoose.connect(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  });
});

// Clearing the database before each test
beforeEach(async () => {
  await Category.deleteMany({});
});

// Close MongoDB connection after all tests are done
afterAll(async () => {
  await mongoose.connection.close();
});

describe("Category Routes", () => {
  describe("/api/v1/categories/create", () => {
    it("should create a new category", async () => {
      const res = await request(app)  
        .post("/api/v1/categories/create")
        .send({ categoryName: "Test Category", description: "Test Description" });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.message).toBe("Category created successfully");
      expect(res.body.categoryCreated).toHaveProperty("_id");
    });
  });

  describe("/api/v1/categories", () => {
    it("should fetch all categories", async () => {
      await Category.create({ categoryName: "Test Category", description: "Test Description" });

      const res = await request(app).get("/api/v1/categories");

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.message).toBe("Category fetched successfully");
      expect(res.body.categories).toBeTruthy();
      expect(res.body.categories.length).toBe(1);
    });
  });

});



 // fetchAllPosts :asyncHandler(async (req, res) => {
  //   const { category_id, title, page = 1, limit = 10 } = req.query;
  
  //   // Basic filter
  //   let filter = { status: "published"  }; // Only include published posts
  //   if (category_id) {
  //     filter.category_id = category_id;
  //   }
  //   if (title) {
  //     filter.content = { $regex: title, $options: "i" };
  //   }
  
  //   // Calculate the date two weeks ago
  //   const twoWeeksAgo = new Date();
  //   twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  
  //   // Common pipeline stages
  //   const commonStages = [
  //     {
  //       $lookup: {
  //         from: "users",
  //         localField: "author",
  //         foreignField: "_id",
  //         as: "user"
  //       }
  //     },
  //     {
  //       $unwind: {
  //         path: "$user",
  //         preserveNullAndEmptyArrays: true
  //       }
  //     },
  //     {
  //       $project: {
  //         "_id": 0,
  //         "id": "$_id",
  //         "title": 1,
  //         "coverImgUrl": 1,
  //         "content": 1,
  //         "authorId": "$user._id",
  //         "authorEmail": "$user.email",
  //         "authorUsername": "$user.username",
  //         "authorProfilePic": "$user.profilePic",
  //         "category_id": 1,
  //         "createdAt": 1,
  //         "tags": 1,
  //         "status": 1
  //       }
  //     },
  //     { $sort: { createdAt: -1 } },
  //     { $skip: (page - 1) * limit },
  //     { $limit: limit }
  //   ];
  
  //   // Aggregation for latest published posts
  //   const latestPublishedPostsArray = [
  //     {
  //       $match: {
  //         ...filter,
  //         createdAt: { $gte: twoWeeksAgo }
  //       }
  //     },
  //     ...commonStages
  //   ];
  
  //   // Aggregation for trending published posts
  //   const trendingPublishedPostsArray = [
  //     {
  //       $match: {
  //         ...filter,
  //         createdAt: { $gte: twoWeeksAgo },
  //         $expr: { $gt: [{ $size: { $ifNull: ["$comments", []] } }, 4] }
  //       }
  //     },
  //     ...commonStages
  //   ];
  
  //   // Aggregation for draft posts (not needed since we are only interested in published posts)
  //   const draftPostsArray = [
  //     {
  //       $match: {
  //         ...filter,
  //         status: "draft"
  //       }
  //     },
  //     ...commonStages
  //   ];
  
  //   // Execute aggregation queries
  //   const [latestPublishedPosts, trendingPublishedPosts, totalPosts, totalUsers] = await Promise.all([
  //     Post.aggregate(latestPublishedPostsArray),
  //     Post.aggregate(trendingPublishedPostsArray),
  //     Post.countDocuments(filter), // Count only published posts
  //     User.countDocuments({})
  //   ]);
  
  //   // Send response to the client
  //   res.json({
  //     status: "success",
  //     message: "Posts fetched successfully",
  //     latestPublishedPosts,
  //     trendingPublishedPosts,
  //     currentPage: page,
  //     perPage: limit,
  //     totalPages: Math.ceil(totalPosts / limit),
  //     totalUsers,
  //     totalPosts
  //   });
  // }),

  // !list all posts
  // fetchAllPosts: asyncHandler(async (req, res) => {
  //   const { category_id, title, page = 1, limit = 10 } = req.query;

  //   // Basic filter
  //   let filter = {};
  //   if (category_id) {
  //     filter.category_id = category_id;
  //   }
  //   if (title) {
  //     filter.content = { $regex: title, $options: "i" };
  //   }

  //   // Calculate the date two weeks ago
  //   const twoWeeksAgo = new Date();
  //   twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  //   // Common pipeline stages
  //   const commonStages = [
  //     {
  //       $lookup: {
  //         from: "users",
  //         localField: "author",  
  //         foreignField: "_id",
  //         as: "user"
  //       }
  //     },
  //     {
  //       $unwind: {
  //         path: "$user",
  //         preserveNullAndEmptyArrays: true
  //       }
  //     },
  //     {
  //       $project: {
  //         "_id": 0,
  //         "id": "$_id",
  //         "title": 1,
  //         "coverImgUrl": 1,
  //         "content": 1,
  //         "authorId": "$user._id",
  //         "authorEmail": "$user.email",
  //         "authorUsername": "$user.username",
  //         "authorProfilePic": "$user.profilePic",
  //         "category_id": 1,
  //         "createdAt": 1,
  //         "tags": 1,
  //         "status": 1
  //       }
  //     },
  //     { $sort: { createdAt: -1 } },
  //     { $skip: (page - 1) * limit },
  //     { $limit: limit }
  //   ];

  //   // Aggregation for latest published posts
  //   const latestPublishedPostsArray = [
  //     {
  //       $match: {
  //         ...filter,
  //         status: "published",
  //         createdAt: { $gte: twoWeeksAgo }
  //       }
  //     },
  //     ...commonStages
  //   ];

  //   // Aggregation for trending published posts
  //   const trendingPublishedPostsArray = [
  //     {
  //       $match: {
  //         ...filter,
  //         status: "published",
  //         createdAt: { $gte: twoWeeksAgo },
  //         $expr: { $gt: [{ $size: { $ifNull: ["$comments", []] } }, 4] }
  //       }
  //     },
  //     ...commonStages
  //   ];

  //   // Aggregation for draft posts
  //   const draftPostsArray = [
  //     {
  //       $match: {
  //         ...filter,
  //         status: "draft"
  //       }
  //     },
  //     ...commonStages
  //   ];

  //   // Execute aggregation queries
  //   const [latestPublishedPosts, trendingPublishedPosts, draftPosts] = await Promise.all([
  //     Post.aggregate(latestPublishedPostsArray),
  //     Post.aggregate(trendingPublishedPostsArray),
  //     Post.aggregate(draftPostsArray)
  //   ]);

  //   // Total posts
  //   const totalPosts = await Post.countDocuments(filter);

  //   // Send response to the client
  //   res.json({
  //     status: "success",
  //     message: "Posts fetched successfully",
  //     latestPublishedPosts,
  //     trendingPublishedPosts,
  //     draftPosts,
  //     currentPage: page,
  //     perPage: limit,
  //     totalPages: Math.ceil(totalPosts / limit)
  //   });
  // }),


  
  // delete: asyncHandler(async (req, res) => {
  //   try {
  //     //get the post id from params
  //     const postId = req.params.postId;
  //     const post = await Post.findById(postId)
  //     if (!post) {
  //       return res.status(404).json({
  //         status: "fail",
  //         message: "Post not found",
  //       })
  //     }
  //     // Check if the logged-in user is the author of the post
  //     if (post.author !== req.auth_id) {
  //       return res.status(403).json({
  //         status: "error",
  //         message: "You are not authorized to delete this post",
  //       });
  //     }
  //     //find the post
  //     await Post.findByIdAndDelete(postId);
  //     res.json({
  //       status: "success",
  //       message: "Post deleted successfully",
  //     });
  //   } catch (error) {

  //   }
  // }),