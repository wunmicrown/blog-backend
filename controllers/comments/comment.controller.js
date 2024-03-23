const asyncHandler = require("express-async-handler");
const Post = require("../../model/post/post.model");
const Comment = require("../../model/comments/comment.model");

const commentsController = {
    // Create comments
    createComment: asyncHandler(async (req, res) => {
        // . Find the post Id
        const { postId, content } = req.body;
        // . Find the post
        const post = await Post.findById(postId);
        if (!post) {
            throw new Error("Post not found");
        }
        //. Create the comment
        const commentCreated = await Comment.create({
            content,
            author: req.auth_id,
            postId
        });

        //. Push the comment to the post
        post.comments.push(commentCreated?._id);
        await post.save();

        //. Send the response
        res.json({
            status: "success",
            message: "Comment created successfully",
            commentCreated,
        });
    })
};

module.exports = commentsController;