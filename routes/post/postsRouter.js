const express = require("express");
const multer = require("multer");
const { TOKEN_MIDDLEWARE } = require("../../middleWares/authenticateToken");
const postController = require("../../controllers/posts/post.controller");

//create multer instance
const upload = multer({ storage });

//!create instance express router
const postRouter = express.Router();

//-----Create post----

postRouter.post(
    "/create",
    TOKEN_MIDDLEWARE,
    upload.single("image"),
    postController.createPost
  );







module.exports = postRouter;
