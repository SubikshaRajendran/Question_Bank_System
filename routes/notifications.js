const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// Get unread notifications for a user
router.get('/user/:userId', async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.params.userId, isRead: false })
            .populate('courseId', 'title')
            .populate('commentId')
            .sort({ createdAt: -1 });
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        );
        res.json(notification);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
