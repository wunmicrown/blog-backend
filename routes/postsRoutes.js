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

//----update post----
postsRoutes.put("/postId", TOKEN_MIDDLEWARE, multerCloudUploader.single("image"), postController.update);



module.exports = postsRoutes;
