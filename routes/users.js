const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const Question = require('../models/Question');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const streamifier = require('streamifier');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dqi4crgop',
    api_key: process.env.CLOUDINARY_API_KEY || '862391676162651',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'fMg_2vRP_5NCLTeLuM56SxSjuUQ'
});

// Configure Multer (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const streamUpload = (req) => {
    return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
            { folder: 'qb_profiles' },
            (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
            }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
};

// Get ALL students (for Admin) - MOVED TO TOP to prevent masking
router.get('/', async (req, res) => {
    try {
        console.log('GET /api/users hit'); // Debug log
        // Fetch all users, sorted by most recent activity (lastLogin) desc
        // Filter out users who have never logged in (old records without lastLogin)
        const users = await User.find({ lastLogin: { $exists: true, $ne: null } })
            .select('username email lastLogin createdAt name isOnline')
            .sort({ lastLogin: -1 });
        res.json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: err.message });
    }
});

// Register a course
router.post('/:id/register-course', async (req, res) => {
    try {
        const { courseId } = req.body;
        const user = await User.findById(req.params.id);
        if (!user.registeredCourses.includes(courseId)) {
            user.registeredCourses.push(courseId);
            await user.save();
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get registered courses with progress
router.get('/:id/registered-courses', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('registeredCourses').lean();

        // Update last activity
        await User.findByIdAndUpdate(req.params.id, { lastLogin: new Date(), isOnline: true });

        if (!user) return res.status(404).json({ error: 'User not found' });

        const coursesWithProgress = [];

        for (const course of user.registeredCourses) {
            let progress = 0;
            const totalQuestions = await Question.countDocuments({ courseId: course._id });

            if (totalQuestions > 0) {
                const courseQuestions = await Question.find({ courseId: course._id }).select('_id');
                const courseQIds = courseQuestions.map(q => q._id.toString());
                const readCount = user.readQuestions.filter(qId => courseQIds.includes(qId.toString())).length;
                progress = Math.round((readCount / totalQuestions) * 100);
            }

            coursesWithProgress.push({
                ...course,
                isRegistered: true, // It is registered by definition
                progress
            });
        }

        res.json(coursesWithProgress);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Mark question as read
router.post('/:id/read-question', async (req, res) => {
    try {
        const { questionId } = req.body;
        const user = await User.findById(req.params.id);
        if (!user.readQuestions.includes(questionId)) {
            user.readQuestions.push(questionId);
            await user.save();
        }
        res.json(user.readQuestions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get read questions
router.get('/:id/read-questions', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.json(user.readQuestions || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Flag/Unflag question (Toggle)
router.post('/:id/flag-question', async (req, res) => {
    try {
        const { questionId } = req.body;
        const user = await User.findById(req.params.id);

        // Fix: Convert ObjectIds to strings for comparison
        const isFlagged = user.flaggedQuestions.some(id => id.toString() === questionId);

        if (isFlagged) {
            // Unflag
            user.flaggedQuestions = user.flaggedQuestions.filter(id => id.toString() !== questionId);
        } else {
            // Flag
            user.flaggedQuestions.push(questionId);
        }

        await user.save();
        res.json(user.flaggedQuestions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get flagged questions (Populated with Question details)
router.get('/:id/flagged-questions', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate({
                path: 'flaggedQuestions',
                populate: { path: 'courseId', model: 'Course' }
            });

        res.json(user.flaggedQuestions || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get User Dashboard Data (All Courses with Progress)
router.get('/:id/dashboard-data', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Update last activity
        user.lastLogin = new Date();
        user.isOnline = true;
        await user.save();

        const allCourses = await Course.find().sort({ order: 1 }).lean();
        const coursesData = [];

        for (const course of allCourses) {
            const isRegistered = user.registeredCourses.some(id => id.toString() === course._id.toString());

            // Calculate progress if registered
            let progress = 0;
            if (isRegistered) {
                // Count total questions for course
                const totalQuestions = await Question.countDocuments({ courseId: course._id });
                if (totalQuestions > 0) {
                    // Count read questions for this course
                    // We need to filter user.readQuestions by courseId
                    // This is inefficient. Better:
                    // Find questions for this course
                    const courseQuestions = await Question.find({ courseId: course._id }).select('_id');
                    const courseQIds = courseQuestions.map(q => q._id.toString());

                    const readCount = user.readQuestions.filter(qId => courseQIds.includes(qId.toString())).length;
                    progress = Math.round((readCount / totalQuestions) * 100);
                } else {
                    progress = 0; // Or 100 if no questions? Let's say 0.
                }
            }

            coursesData.push({
                ...course,
                isRegistered,
                progress
            });
        }

        res.json({ allCourses: coursesData });
    } catch (err) {
        console.error("Dashboard Data Error:", err);
        res.status(500).json({ error: err.message });
    }
});


// Verify Password
router.post('/:id/verify-password', async (req, res) => {
    try {
        const { password } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            res.json({ success: true });
        } else {
            res.status(401).json({ success: false, message: "Incorrect password" });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Update Profile (with image upload)
router.put('/:id/profile', upload.single('profilePicture'), async (req, res) => {
    try {
        const { username, newPassword, fullName, department, phoneNumber } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Update Username (check uniqueness if changed)
        if (username && username !== user.username) {
            const exists = await User.findOne({ username });
            if (exists) return res.status(400).json({ message: 'Username already taken' });
            user.username = username;
        }

        // Update Password
        if (newPassword) {
            user.password = await bcrypt.hash(newPassword, 10);
        }

        // Update Details
        // Update Details
        if (fullName !== undefined) user.fullName = fullName;
        if (department !== undefined) user.department = department;
        if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;

        // Handle Image Upload
        if (req.file) {
            const result = await streamUpload(req);
            user.profilePicture = result.secure_url;
        }

        await user.save();

        // Return updated user object (excluding password)
        const userObj = user.toObject();
        delete userObj.password;

        res.json({ success: true, user: userObj });

    } catch (err) {
        console.error("Profile Update Error:", err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
