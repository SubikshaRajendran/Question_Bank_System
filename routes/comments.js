const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');

// Create a comment (Student)
router.post('/', async (req, res) => {
    try {
        const { userId, questionId, courseId, text } = req.body;
        const comment = new Comment({ userId, questionId, courseId, text });
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
            .populate('userId', 'name email')
            .populate('questionId', 'text')
            .populate('courseId', 'title')
            .sort({ createdAt: -1 });
        res.json(comments);
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
        );
        res.json(comment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
