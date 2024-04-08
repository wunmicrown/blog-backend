const express = require('express');
const { TOKEN_MIDDLEWARE } = require('../middleWares/authenticateToken');
const commentsController = require('../controllers/comments/comment.controller');


// Create instance of express router
const commentRoutes = express.Router();

// ------Create comment------
commentRoutes.post("/create-comment", TOKEN_MIDDLEWARE, commentsController.createComment)
// ----Get comments  for a specific post----
commentRoutes.get("/get-comments/:postId", commentsController.getComments);

module.exports = commentRoutes;