const express = require("express");
const { TOKEN_MIDDLEWARE } = require("../middleWares/authenticateToken");
const postController = require("../controllers/posts/post.controller");


//!create instance express router
const postsRoutes = express.Router();

//-----Create post----

postsRoutes.post( "/create",TOKEN_MIDDLEWARE, postController.createPost);





module.exports = postsRoutes;
