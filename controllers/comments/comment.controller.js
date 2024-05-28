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

            // Ensure that post exists and get the author ID
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
                        profilePic: '$ownerDetails.profilePic',
                        owner: 1
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
                totalPages: Math.ceil(totalComments / limit),
            });
        } catch (error) {
            console.error('Error retrieving comments:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }),

    deleteComment: asyncHandler(async (req, res) => {
        try {
            const commentId = req.params.commentId;

            // Check if commentId is a valid ObjectId
            if (!mongoose.Types.ObjectId.isValid(commentId)) {
                return res.status(400).json({ error: "Invalid commentId" });
            }

            // Find the comment by ID
            const comment = await Comment.findById(commentId);
            if (!comment) {
                return res.status(404).json({ message: 'Comment not found' });
            }
            // Find the related post
            const post = await Post.findById(comment.postId);
            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }

            // Check if the authenticated user is either the comment owner or the post author
            if (comment.owner.toString() !== req.auth_id.toString() && post.author.toString() !== req.auth_id.toString()) {
                return res.status(403).json({ message: 'Unauthorized' });
            }

            // Remove the comment and update the post
            await Comment.findByIdAndDelete(commentId);
            post.comments.pull(commentId);
            post.commentsCount -= 1;
            await post.save();

            res.json({
                status: 'success',
                message: 'Comment deleted successfully',
            });
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }),

    updateComment: asyncHandler(async (req, res) => {
        try {
            const commentId = req.params.commentId;
            const { content } = req.body;

            if (!mongoose.Types.ObjectId.isValid(commentId)) {
                return res.status(400).json({ error: "Invalid commentId" });
            }

            if (!content || typeof content !== "string") {
                return res.status(400).json({ error: "Invalid content" });
            }

            const comment = await Comment.findById(commentId);
            if (!comment) {
                return res.status(404).json({ message: 'Comment not found' });
            }

            if (comment.owner.toString() !== req.auth_id.toString()) {
                return res.status(403).json({ message: 'Unauthorized' });
            }

            comment.content = content;
            await comment.save();

            const updatedComment = await Comment.aggregate([
                { $match: { _id: new mongoose.Types.ObjectId(commentId) } },
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
                }
            ]);

            res.json({
                status: 'success',
                message: 'Comment updated successfully',
                comment: updatedComment[0],
            });
        } catch (error) {
            console.error('Error updating comment:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }),
};

module.exports = commentsController;