const asyncHandler = require("express-async-handler");
const Post = require("../../model/post/post.model");
const Comment = require("../../model/comments/comment.model");
const User = require("../../model/user/user.model"); // Import the User model

const commentsController = {
    // !Create comments
    createComment: asyncHandler(async (req, res) => {
        //----Find the post Id----
        const { postId, content, authorAvatar } = req.body; // Include authorAvatar in request body
        console.log({ postId, content, authorAvatar });
        // ----Find the post----
        const post = await Post.findById(postId);
        console.log("posts", { post });
        if (!post) {
            throw new Error("Post not found");
        }
        // ----Find the user----
        const user = await User.findById(req.auth_id);
        console.log("user", { user });
        if (!user) {
            throw new Error("User not found");
        }

        const commentData = {
            content,
            author: user.username,
            postId
        };

        // ----Add authorAvatar to commentData if it exists----
        if (authorAvatar) {
            commentData.authorAvatar = authorAvatar;
        }

        const commentCreated = await Comment.create(commentData);

        // ----Push the comment to the post----
        post.comments.push(commentCreated._id);
        await post.save();

        // ----Send the response----
        res.json({
            status: "success",
            message: "Comment created successfully",
            commentCreated,
        });
    }),

    // !Get comments by postId
    getComments: asyncHandler(async (req, res) => {
        try {
            const postId = req.params.postId;

            // ----Find the post----
            const post = await Post.findById(postId).populate('comments');

            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }

            // ----Send the comments associated with the post----
            res.json({
                status: "success",
                message: "Comments retrieved successfully",
                comments: post.comments,
            });
        } catch (error) {
            console.error('Error retrieving comments:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }),
};

module.exports = commentsController;
