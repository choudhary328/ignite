import asyncHandler from 'express-async-handler';
import Comment from '../models/Comment.js';

// @desc    Get comments for an event
// @route   GET /api/events/:id/comments
// @access  Private
const getCommentsByEvent = asyncHandler(async (req, res) => {
    const comments = await Comment.find({ event: req.params.id })
        .sort({ createdAt: -1 })
        .populate('user', 'name imageUrl');
    res.json(comments);
});

// @desc    Post a comment to an event
// @route   POST /api/events/:id/comments
// @access  Private
const postComment = asyncHandler(async (req, res) => {
    const { text } = req.body;
    if (!text) {
        res.status(400);
        throw new Error('Comment text is required');
    }

    const comment = await Comment.create({
        event: req.params.id,
        user: req.user._id,
        userName: req.user.name,
        text,
    });

    res.status(201).json(comment);
});

export { getCommentsByEvent, postComment };
