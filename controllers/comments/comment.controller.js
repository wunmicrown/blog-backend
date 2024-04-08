const asyncHandler = require("express-async-handler");
const Post = require("../../model/post/post.model");
const Comment = require("../../model/comments/comment.model");
const User = require("../../model/user/user.model"); // Import the User model

const commentsController = {
    // Create comments
    createComment: asyncHandler(async (req, res) => {
        // Find the post Id
        const { postId, content } = req.body;
        console.log({ postId, content});
        // Find the post
        const post = await Post.findById(postId);
        console.log("posts",{ post });
        if (!post) {
            throw new Error("Post not found");
        }
        // Find the user
        const user = await User.findById(req.auth_id); 
        console.log("user",{ user });
        if (!user) {
            throw new Error("User not found");
        }
       
const commentCreated = await Comment.create({
    content,
    author: user.username,
    postId
});


        // Push the comment to the post
        post.comments.push(commentCreated._id); 
        await post.save();

        // Send the response
        res.json({
            status: "success",
            message: "Comment created successfully",
            commentCreated,
        });
    })
};

module.exports = commentsController;
