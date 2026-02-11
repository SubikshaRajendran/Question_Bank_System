const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Question = require('../models/Question');
const Comment = require('../models/Comment');

const multer = require('multer');
const path = require('path');

// ... (existing code)

// Delete course
router.delete('/:id', async (req, res) => {
    try {
        await Course.findByIdAndDelete(req.params.id);
        await Question.deleteMany({ courseId: req.params.id });
        await Comment.deleteMany({ courseId: req.params.id });
        res.json({ message: 'Course deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const mult = require('multer'); // Wait, 'multer' is at line 7. Cleaning up imports.
const streamifier = require('streamifier');

const cloudinary = require('cloudinary').v2;

const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
    cloud_name: 'dqi4crgop',
    api_key: '862391676162651',
    api_secret: 'fMg_2vRP_5NCLTeLuM56SxSjuUQ'
});

console.log("Cloudinary Config:", cloudinary.config()); // Debugging line

// Configure Multer to use memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const streamUpload = (req) => {
    return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
            { folder: 'qb_courses' },
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

// Get all courses with filtering
router.get('/', async (req, res) => {
    try {
        const { search, difficulty, tags } = req.query;
        let query = {};

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        if (difficulty) {
            query.difficulty = difficulty;
        }
        if (tags) {
            const tagList = tags.split(',').map(t => t.trim());
            query.tags = { $in: tagList };
        }

        const courses = await Course.find(query);
        res.json(courses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a course
router.post('/', upload.single('image'), async (req, res) => {
    const { title, description, difficulty, department, tags } = req.body;
    let image = '';

    try {
        if (req.file) {
            // Manual upload to Cloudinary
            const result = await streamUpload(req);
            image = result.secure_url;
        }

        const newCourse = new Course({ title, description, difficulty, department, tags: tags ? tags.split(',') : [], image });
        await newCourse.save();
        res.json(newCourse);
    } catch (err) {
        console.error("Upload Error:", err);
        res.status(400).json({ error: err.message });
    }
});

// Get single course (with questions)
router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        const questions = await Question.find({ courseId: req.params.id });
        const studentCount = await require('../models/User').countDocuments({ registeredCourses: req.params.id });

        res.json({ course, questions, studentCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update course
router.put('/:id', upload.single('image'), async (req, res) => {
    const { title, description, difficulty, department, tags } = req.body;
    let updateData = { title, description, difficulty, department, tags: tags ? tags.split(',') : [] };

    try {
        if (req.file) {
            const result = await streamUpload(req);
            updateData.image = result.secure_url;
        }

        const updatedCourse = await Course.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(updatedCourse);
    } catch (err) {
        console.error("Update Error:", err);
        res.status(400).json({ error: err.message });
    }
});

// Delete course
router.delete('/:id', async (req, res) => {
    try {
        await Course.findByIdAndDelete(req.params.id);
        await Question.deleteMany({ courseId: req.params.id });
        await Comment.deleteMany({ courseId: req.params.id });
        res.json({ message: 'Course deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add question
router.post('/:id/questions', async (req, res) => {
    try {
        const { text } = req.body;
        const newQuestion = new Question({
            courseId: req.params.id,
            text
        });
        await newQuestion.save();
        await Course.findByIdAndUpdate(req.params.id, { $push: { questions: newQuestion._id } });
        res.json(newQuestion);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update question text
router.put('/questions/:questionId', async (req, res) => {
    try {
        const { text } = req.body;
        const updatedQuestion = await Question.findByIdAndUpdate(
            req.params.questionId,
            { text },
            { new: true }
        );
        res.json(updatedQuestion);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete question
router.delete('/questions/:questionId', async (req, res) => {
    try {
        const question = await Question.findByIdAndDelete(req.params.questionId);
        if (question) {
            await Course.findByIdAndUpdate(question.courseId, { $pull: { questions: req.params.questionId } });
        }
        res.json({ message: 'Question deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// BULK ACTIONS

// Bulk Delete Questions
router.post('/questions/bulk-delete', async (req, res) => {
    const { questionIds } = req.body; // Array of IDs
    try {
        // Find questions to get their course IDs before deleting (to update course refs)
        const questions = await Question.find({ _id: { $in: questionIds } });
        const courseIds = [...new Set(questions.map(q => q.courseId))];

        await Question.deleteMany({ _id: { $in: questionIds } });

        // Pull from courses
        await Course.updateMany(
            { _id: { $in: courseIds } },
            { $pull: { questions: { $in: questionIds } } }
        );

        res.json({ success: true, message: `${questionIds.length} questions deleted` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Move Questions to another Course
router.put('/questions/move', async (req, res) => {
    const { questionIds, targetCourseId } = req.body;
    try {
        // Update Questions
        await Question.updateMany(
            { _id: { $in: questionIds } },
            { $set: { courseId: targetCourseId } }
        );

        // Remove from source courses
        // We need to know which courses they came from. 
        // A bit complex in one query. Easiest is to fetch first.
        // Or just pull these IDs from ALL courses (except target?? No, pull from all, push to target)

        // 1. Pull from all courses
        await Course.updateMany(
            {},
            { $pull: { questions: { $in: questionIds } } }
        );

        // 2. Push to target course
        await Course.findByIdAndUpdate(targetCourseId, {
            $addToSet: { questions: { $each: questionIds } }
        });

        res.json({ success: true, message: 'Questions moved successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
