const express = require("express");
const { TOKEN_MIDDLEWARE } = require("../middleWares/authenticateToken");
const postController = require("../controllers/posts/post.controller");
const { multerCloudUploader } = require("../middleWares/multerUpload");



//!create instance express router
const postsRoutes = express.Router();

//-----Create post----

postsRoutes.post("/create", TOKEN_MIDDLEWARE, multerCloudUploader.single("image"), postController.createPost);

//----lists all posts----
postsRoutes.get("/", postController.fetchAllPosts);

// Fetch post details by postId
postsRoutes.get("/:postId", postController.fetchPostDetails); 

// ---delete post---
postsRoutes.put("/:postId", TOKEN_MIDDLEWARE, postController.delete);


//----update post----
postsRoutes.put("/:postId", TOKEN_MIDDLEWARE, multerCloudUploader.single("image"), postController.update);


//---like post----
postsRoutes.put("/likes/:postId", TOKEN_MIDDLEWARE, postController.like);
postsRoutes.put("/dislikes/:postId", TOKEN_MIDDLEWARE, postController.dislike);


module.exports = postsRoutes;
