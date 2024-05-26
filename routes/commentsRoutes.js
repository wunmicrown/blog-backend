// const express = require('express');
// const { TOKEN_MIDDLEWARE } = require('../middleWares/authenticateToken');
// const commentsController = require('../controllers/comments/comment.controller');

// // Create instance of express router
// const commentRoutes = express.Router();

// // ------Create comment------
// commentRoutes.post("/create-comment", TOKEN_MIDDLEWARE, commentsController.createComment);
// // ----Get comments for a specific post----
// commentRoutes.get("/get-comments/:postId", commentsController.getComments);
// // ----Delete comment by ID----
// commentRoutes.delete("/delete-comment/:commentId", TOKEN_MIDDLEWARE, commentsController.deleteComment);
// // ----Update comment by ID----
// commentRoutes.put("/update-comment/:commentId", TOKEN_MIDDLEWARE, commentsController.updateComment);

// module.exports = commentRoutes;


const express = require('express');
const { TOKEN_MIDDLEWARE } = require('../middleWares/authenticateToken');
const commentsController = require('../controllers/comments/comment.controller');


// Create instance of express router
const commentRoutes = express.Router();

// ------Create comment------
commentRoutes.post("/create-comment", TOKEN_MIDDLEWARE, commentsController.createComment)
// ----Get comments  for a specific post----
commentRoutes.get("/get-comments/:postId", commentsController.getComments);

// ----Delete comment by ID----
commentRoutes.delete("/delete-comment/:commentId", TOKEN_MIDDLEWARE, commentsController.deleteComment);
commentRoutes.put("/update-comment/:commentId", TOKEN_MIDDLEWARE, commentsController.updateComment);


module.exports = commentRoutes;