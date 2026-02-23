const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');

// Create a comment (Student)
router.post('/', async (req, res) => {
    try {
        const { userId, questionId, courseId, text } = req.body;

        let type = 'question';
        if (!questionId && !courseId) {
            type = 'general';
        }

        const comment = new Comment({
            userId,
            questionId: questionId || undefined,
            courseId: courseId || undefined,
            text,
            type
        });

        await comment.save();
        res.status(201).json(comment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get comments for a student (My Comments)
router.get('/student/:userId', async (req, res) => {
    try {
        const comments = await Comment.find({ userId: req.params.userId })
            .populate('questionId', 'text')
            .populate('courseId', 'title')
            .sort({ createdAt: -1 });
        res.json(comments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all comments (Admin)
router.get('/admin', async (req, res) => {
    try {
        const comments = await Comment.find()
            .populate('userId', 'name username email')
            .populate('questionId', 'text')
            .populate('courseId', 'title')
            .sort({ createdAt: -1 });
        res.json(comments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all unread comments for admin notifications
router.get('/admin/unread', async (req, res) => {
    try {
        const unreadComments = await Comment.find({ isAdminRead: false })
            .populate('userId', 'name username email')
            .populate('questionId', 'text')
            .populate('courseId', 'title')
            .sort({ createdAt: -1 });
        res.json(unreadComments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Mark a specific comment notification as read
router.put('/admin/mark-read/:id', async (req, res) => {
    try {
        const comment = await Comment.findByIdAndUpdate(
            req.params.id,
            { isAdminRead: true },
            { new: true }
        );
        res.json(comment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Reply to a comment (Admin)
router.put('/:id/reply', async (req, res) => {
    try {
        const { reply } = req.body;
        const comment = await Comment.findByIdAndUpdate(
            req.params.id,
            { reply, isResolved: true },
            { new: true }
        )
            .populate('userId', 'name username email')
            .populate('questionId', 'text')
            .populate('courseId', 'title');

        if (comment) {
            const notification = new Notification({
                userId: comment.userId._id, // because populated
                type: 'reply',
                message: comment.type === 'question' ? 'Admin answered' : 'Admin replied',
                commentId: comment._id
            });
            await notification.save();
        }

        res.json(comment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a comment (Admin)
router.delete('/:id', async (req, res) => {
    try {
        await Comment.findByIdAndDelete(req.params.id);
        res.json({ message: 'Comment deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
