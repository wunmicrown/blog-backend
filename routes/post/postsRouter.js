const express = require("express");
const multer = require("multer");
const { TOKEN_MIDDLEWARE } = require("../../middleWares/authenticateToken");
const postController = require("../../controllers/posts/post.controller");


//!create instance express router
const postRouter = express.Router();

//-----Create post----

postRouter.post(
    "/create",
    TOKEN_MIDDLEWARE,
    postController.createPost
  );







module.exports = postRouter;
