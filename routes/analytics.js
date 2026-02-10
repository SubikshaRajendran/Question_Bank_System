const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const Question = require('../models/Question');

// Admin Analytics
router.get('/admin/stats', async (req, res) => {
    try {
        // 1. Most Flagged Questions
        // We need to aggregate from Users.flaggedQuestions
        // Since it's an array of ObjectIds in User, we can unwind and group by questionId
        const flaggedStats = await User.aggregate([
            { $unwind: "$flaggedQuestions" },
            { $group: { _id: "$flaggedQuestions", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // Populate Question details
        // Manually populate since aggregate returns raw IDs
        const flaggedDetails = [];
        for (const stat of flaggedStats) {
            const q = await Question.findById(stat._id);
            if (q) {
                // Find course name too
                const c = await Course.findById(q.courseId);
                flaggedDetails.push({
                    question: q.text,
                    course: c ? c.title : 'Unknown',
                    count: stat.count
                });
            }
        }

        // 2. Popular Courses (most registered users)
        const popularCourses = await User.aggregate([
            { $unwind: "$registeredCourses" },
            { $group: { _id: "$registeredCourses", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        const courseDetails = [];
        for (const stat of popularCourses) {
            const c = await Course.findById(stat._id);
            if (c) {
                courseDetails.push({
                    title: c.title,
                    count: stat.count
                });
            }
        }

        // 3. General Dashboard Counts
        const totalCourses = await Course.countDocuments();
        const totalQuestions = await Question.countDocuments();
        const totalStudents = await User.countDocuments({ role: 'student' });
        // const totalStudents = await User.countDocuments({ role: 'student' }); // Assuming role exists, or just count all Users

        res.json({
            flagged: flaggedDetails,
            popular: courseDetails,
            totalCourses,
            totalQuestions,
            totalStudents
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
