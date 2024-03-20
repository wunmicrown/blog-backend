const express = require("express");
const { TOKEN_MIDDLEWARE } = require("../../middleWares/authenticateToken");
const postController = require("../../controllers/posts/post.controller");
const { multerCloudUploader } = require("../../middleWares/multerUpload");


//!create instance express router
const postRouter = express.Router();

//-----Create post----

postRouter.post( "/create",TOKEN_MIDDLEWARE, postController.createPost);
postRouter.post( "/create/uploads",TOKEN_MIDDLEWARE,multerCloudUploader.single("image"), postController.uploads);





module.exports = postRouter;
