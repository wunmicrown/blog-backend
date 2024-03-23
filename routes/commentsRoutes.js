const express = require('express');
const { TOKEN_MIDDLEWARE } = require('../middleWares/authenticateToken');
const commentsController = require('../controllers/comments/comment.controller');


// Create instance of express router
const commentRoutes=express.Router();

// ------Create comment------
commentRoutes.post("/create-comment", TOKEN_MIDDLEWARE, commentsController.createComment)

module.exports=commentRoutes;