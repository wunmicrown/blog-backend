const express = require('express');
const { TOKEN_MIDDLEWARE } = require('../middleWares/authenticateToken');


// Create instance of express router
const commentRoutes=express.Router();

// ------Create comment------
commentRoutes.post("/create-comment", TOKEN_MIDDLEWARE)

module.exports=commentRoutes;