const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Post = require("../../model/post/post.model");
const Comment = require("../../model/comments/comment.model");
const User = require("../../model/user/user.model");

const commentsController = {
    createComment: asyncHandler(async (req, res) => {
        const { postId, content } = req.body;

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ error: "Invalid postId" });
        }
        if (!content || typeof content !== "string") {
            return res.status(400).json({ error: "Invalid content" });
        }

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
            owner: user._id,
            postId
        };

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
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 25;
            const skip = (page - 1) * limit;

            if (!mongoose.Types.ObjectId.isValid(postId)) {
                return res.status(400).json({ error: "Invalid postId" });
            }

            // Ensure that post exists
            const post = await Post.findById(postId);
            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }

            // Aggregate pipeline with pagination
            const comments = await Comment.aggregate([
                { $match: { postId: new mongoose.Types.ObjectId(postId) } },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'owner',
                        foreignField: '_id',
                        as: 'ownerDetails'
                    }
                },
                { $unwind: '$ownerDetails' },
                {
                    $project: {
                        content: 1,
                        postId: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        username: '$ownerDetails.username',
                        profilePic: '$ownerDetails.profilePic'
                    }
                },
                { $skip: skip },
                { $limit: limit }
            ]);

            // Get total comment count
            const totalComments = await Comment.countDocuments({ postId: new mongoose.Types.ObjectId(postId) });

            res.json({
                status: "success",
                message: "Comments retrieved successfully",
                comments,
                totalComments,
                page,
                totalPages: Math.ceil(totalComments / limit)
            });
        } catch (error) {
            console.error('Error retrieving comments:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }),

    deleteComment: asyncHandler(async (req, res) => {
        try {
            const commentId = req.params.commentId;

            if (!mongoose.Types.ObjectId.isValid(commentId)) {
                return res.status(400).json({ error: "Invalid commentId" });
            }

            const comment = await Comment.findById(commentId);
            if (!comment) {
                return res.status(404).json({ message: 'Comment not found' });
            }

            const postId = comment.postId;

            await comment.remove();

            const post = await Post.findById(postId);
            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }

            post.comments.pull(commentId);
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
