const asyncHandler = require("express-async-handler");
const Post = require("../../model/post/post.model");
const Comment = require("../../model/comments/comment.model");
const User = require("../../model/user/user.model");

const commentsController = {
    createComment: asyncHandler(async (req, res) => {
        const { postId, content, authorAvatar } = req.body;
        
        const post = await Post.findById(postId);
        if (!post) {
            throw new Error("Post not found");
        }
        
        const user = await User.findById(req.auth_id);
        if (!user) {
            throw new Error("User not found");
        }

        const commentData = {
            content,
            author: user.username,
            postId
        };

        if (authorAvatar) {
            commentData.authorAvatar = authorAvatar;
        }

        const commentCreated = await Comment.create(commentData);

        post.comments.push(commentCreated._id);
        post.commentsCount += 1; // Increment the comment count
        await post.save();

        res.json({
            status: "success",
            message: "Comment created successfully",
            commentCreated,
        });
    }),

    getComments: asyncHandler(async (req, res) => {
        try {
            const postId = req.params.postId;

            const post = await Post.findById(postId).populate('comments');

            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }

            res.json({
                status: "success",
                message: "Comments retrieved successfully",
                comments: post.comments,
                commentsCount: post.commentsCount // Include the comment count in the response
            });
        } catch (error) {
            console.error('Error retrieving comments:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }),
    deleteComment: asyncHandler(async (req, res) => {
        try {
            const commentId = req.params.commentId;

            const comment = await Comment.findById(commentId);
            if (!comment) {
                return res.status(404).json({ message: 'Comment not found' });
            }

            // Get the postId of the comment
            const postId = comment.postId;

            // Delete the comment
            await comment.remove();

            // Decrement the commentsCount in the Post model
            const post = await Post.findById(postId);
            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }

            // Remove the comment's _id from the comments array of the post
            post.comments.pull(commentId);

            // Decrement the comment count
            post.commentsCount -= 1;

            await post.save();

            res.json({
                status: 'success',
                message: 'Comment deleted successfully',
            });
        } catch (error) {
            console.error('Error deleting comment:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }),
};

module.exports = commentsController;
