const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const Course = require('../models/Course');

// Get all questions (optionally filter by course)
router.get('/', async (req, res) => {
    try {
        const query = {};
        if (req.query.courseId) {
            query.courseId = req.query.courseId;
        }
        const questions = await Question.find(query).populate('courseId', 'title');
        res.json(questions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Bulk Create Questions
router.post('/bulk-create', async (req, res) => {
    const { questions, courseId } = req.body;
    try {
        if (!questions || !Array.isArray(questions)) {
            return res.status(400).json({ error: 'Questions array is required' });
        }

        const questionDocs = questions.map(text => ({
            text,
            courseId
        }));

        const insertedQuestions = await Question.insertMany(questionDocs);
        const insertedIds = insertedQuestions.map(q => q._id);

        await Course.findByIdAndUpdate(courseId, { $push: { questions: { $each: insertedIds } } });

        res.json(insertedQuestions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a question
router.post('/', async (req, res) => {
    const { text, courseId } = req.body;
    try {
        const newQuestion = new Question({ text, courseId });
        await newQuestion.save();

        // Add to course's question list
        await Course.findByIdAndUpdate(courseId, { $push: { questions: newQuestion._id } });

        res.json(newQuestion);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update a question
router.put('/:id', async (req, res) => {
    try {
        const { text } = req.body;
        const updatedQuestion = await Question.findByIdAndUpdate(
            req.params.id,
            { text },
            { new: true }
        );
        res.json(updatedQuestion);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a question
router.delete('/:id', async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) return res.status(404).json({ error: 'Question not found' });

        await Question.findByIdAndDelete(req.params.id);

        // Remove from course
        await Course.findByIdAndUpdate(question.courseId, { $pull: { questions: req.params.id } });

        res.json({ message: 'Question deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Bulk Delete
router.post('/bulk-delete', async (req, res) => {
    const { questionIds } = req.body;
    try {
        // Get questions to find their courses
        const questions = await Question.find({ _id: { $in: questionIds } });

        // Remove from questions collection
        await Question.deleteMany({ _id: { $in: questionIds } });

        // Remove from courses
        // This is a bit expensive if many courses, but reliable
        for (const q of questions) {
            await Course.findByIdAndUpdate(q.courseId, { $pull: { questions: q._id } });
        }

        res.json({ message: 'Questions deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Bulk Move
router.post('/bulk-move', async (req, res) => {
    const { questionIds, targetCourseId } = req.body;
    try {
        const questions = await Question.find({ _id: { $in: questionIds } });

        for (const q of questions) {
            // Remove from old course
            await Course.findByIdAndUpdate(q.courseId, { $pull: { questions: q._id } });

            // Add to new course
            await Course.findByIdAndUpdate(targetCourseId, { $push: { questions: q._id } });

            // Update question's courseId
            q.courseId = targetCourseId;
            await q.save();
        }

        res.json({ message: 'Questions moved' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
