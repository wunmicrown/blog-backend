const asyncHandler = require("express-async-handler");

const commentsController = {
    // Create comments
    createComment: asyncHandler(async (req, res) => {
        // . Find the post Id
        const {postId, content}= req.body;
        // . Find the post
    })
};

module.exports = commentsController;