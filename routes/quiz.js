const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const QuizQuestion = require('../models/QuizQuestion');
const QuizResult = require('../models/QuizResult');
const Course = require('../models/Course');

// --------------------------------------------------------
// ADMIN ROUTES
// --------------------------------------------------------

// Fetch all quiz questions for a specific course (Admin view - includes correct answers)
router.get('/admin/course/:courseId', async (req, res) => {
    try {
        const questions = await QuizQuestion.find({ courseId: req.params.courseId }).sort({ createdAt: -1 });
        res.json(questions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching quiz questions' });
    }
});

// Create a new quiz question
router.post('/admin/question', async (req, res) => {
    try {
        const { courseId, question, optionA, optionB, optionC, optionD, correctAnswer } = req.body;

        // Basic validation
        if (!courseId || !question || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const newQuestion = new QuizQuestion({
            courseId,
            question,
            optionA,
            optionB,
            optionC,
            optionD,
            correctAnswer
        });

        await newQuestion.save();
        res.status(201).json(newQuestion);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create quiz question' });
    }
});

// Update a quiz question
router.put('/admin/question/:id', async (req, res) => {
    try {
        const { question, optionA, optionB, optionC, optionD, correctAnswer } = req.body;

        const updatedQuestion = await QuizQuestion.findByIdAndUpdate(
            req.params.id,
            { question, optionA, optionB, optionC, optionD, correctAnswer },
            { new: true, runValidators: true }
        );

        if (!updatedQuestion) {
            return res.status(404).json({ error: 'Question not found' });
        }

        res.json(updatedQuestion);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update quiz question' });
    }
});

// Delete a quiz question
router.delete('/admin/question/:id', async (req, res) => {
    try {
        const deletedQuestion = await QuizQuestion.findByIdAndDelete(req.params.id);
        if (!deletedQuestion) {
            return res.status(404).json({ error: 'Question not found' });
        }
        res.json({ success: true, message: 'Question deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete quiz question' });
    }
});

// Bulk Delete specific quiz questions
router.post('/admin/question/bulk-delete', async (req, res) => {
    try {
        const { questionIds } = req.body;
        if (!Array.isArray(questionIds) || questionIds.length === 0) {
            return res.status(400).json({ error: 'Array of questionIds is required' });
        }

        const result = await QuizQuestion.deleteMany({
            _id: { $in: questionIds }
        });

        res.json({ success: true, message: 'Questions deleted successfully', deletedCount: result.deletedCount });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to bulk delete quiz questions' });
    }
});

// Bulk Import Quiz Questions
router.post('/admin/question/bulk', async (req, res) => {
    try {
        const { questions } = req.body;

        if (!Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ error: 'Valid array of questions is required' });
        }

        // Validate all questions first
        for (const q of questions) {
            if (!q.courseId || !q.question || !q.optionA || !q.optionB || !q.optionC || !q.optionD || !q.correctAnswer) {
                return res.status(400).json({ error: 'One or more questions are missing required fields' });
            }
            if (!['A', 'B', 'C', 'D'].includes(q.correctAnswer)) {
                return res.status(400).json({ error: 'correctAnswer must be A, B, C, or D' });
            }
        }

        const inserted = await QuizQuestion.insertMany(questions);
        res.status(201).json({ success: true, count: inserted.length });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to bulk import quiz questions' });
    }
});

// --------------------------------------------------------
// STUDENT ROUTES
// --------------------------------------------------------

// Fetch quiz questions for a student (EXCLUDES correct answers)
// Randomly selects exactly 20 questions per attempt
router.get('/student/course/:courseId', async (req, res) => {
    try {
        const courseIdObject = new mongoose.Types.ObjectId(req.params.courseId);

        // Aggregate up to 20 random and UNIQUE questions
        // $sample performs random selection without replacement, ensuring no duplicates.
        const questions = await QuizQuestion.aggregate([
            { $match: { courseId: courseIdObject } },
            { $sample: { size: 20 } },
            { $project: { correctAnswer: 0 } } // Exclude the correctAnswer field
        ]);

        res.json(questions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching quiz questions for student' });
    }
});

// Submit a quiz attempt
// Expected body format:
// {
//      studentId: "...id...",
//      courseId: "...id...",
//      answers: {
//          "questionId1": "A",
//          "questionId2": "C"
//      }
// }
router.post('/student/submit', async (req, res) => {
    try {
        const { studentId, courseId, answers } = req.body;

        if (!studentId || !courseId || !answers) {
            return res.status(400).json({ error: 'Missing required submission data' });
        }

        // Extract the specific question IDs submitted by the student
        const submittedQuestionIds = Object.keys(answers);

        if (submittedQuestionIds.length === 0) {
            return res.status(400).json({ error: 'No answers submitted' });
        }

        // Fetch the true answers exclusively for the questions that were submitted in this attempt
        const quizQuestions = await QuizQuestion.find({
            _id: { $in: submittedQuestionIds }
        });

        const totalQuestions = quizQuestions.length;

        if (totalQuestions === 0) {
            return res.status(400).json({ error: 'Invalid questions submitted' });
        }

        let score = 0;

        // Grade the submission against the true values pulled from the DB
        quizQuestions.forEach((q) => {
            const studentAnswer = answers[q._id.toString()];
            if (studentAnswer && studentAnswer === q.correctAnswer) {
                score += 1;
            }
        });

        const percentage = Math.round((score / totalQuestions) * 100);

        let performanceMessage = "";
        let performanceLevel = "";

        if (percentage === 100) {
            performanceMessage = "Excellent! Outstanding performance.";
            performanceLevel = "excellent";
        } else if (percentage >= 80) {
            performanceMessage = "Very Good! Great job.";
            performanceLevel = "very_good";
        } else if (percentage >= 60) {
            performanceMessage = "Good! Keep practicing.";
            performanceLevel = "good";
        } else if (percentage >= 40) {
            performanceMessage = "Average. You can improve.";
            performanceLevel = "average";
        } else {
            performanceMessage = "Needs Improvement. Study and try again.";
            performanceLevel = "poor";
        }

        // Fetch previous attempt for comparison and attempt counting
        const prevAttempt = await QuizResult.findOne({
            studentId,
            courseId
        }).sort({ date: -1 });

        const attemptNumber = prevAttempt ? prevAttempt.attemptNumber + 1 : 1;
        const previousScore = prevAttempt ? prevAttempt.score : null;
        const difference = prevAttempt ? score - prevAttempt.score : null;

        // Save Result, mapping the specific QuestionIDs generated during this run
        const result = new QuizResult({
            studentId,
            courseId,
            questionIds: submittedQuestionIds,
            score,
            totalQuestions,
            percentage,
            attemptNumber
        });

        await result.save();

        // Return the grade
        res.json({
            success: true,
            score,
            totalQuestions,
            percentage,
            performanceMessage,
            performanceLevel,
            attemptNumber,
            previousScore,
            difference,
            resultId: result._id
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to grade quiz submission' });
    }
});

// Fetch leaderboard data based on average quiz percentage
router.get('/student/leaderboard', async (req, res) => {
    try {
        const leaderboardData = await QuizResult.aggregate([
            // 1. Group by student ID, compute average percentage and total attempts
            {
                $group: {
                    _id: "$studentId",
                    averagePercentage: { $avg: "$percentage" },
                    totalAttempts: { $sum: 1 }
                }
            },
            // 1.5 Filter out students with fewer than 3 attempts
            {
                $match: {
                    totalAttempts: { $gte: 3 }
                }
            },
            // 2. Lookup student details from the users collection
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "studentInfo"
                }
            },
            // 3. Unwind the student array
            { $unwind: "$studentInfo" },
            // 4. Project the final structure, rounding the average percentage
            {
                $project: {
                    _id: 0,
                    studentId: "$_id",
                    studentName: "$studentInfo.username",
                    averagePercentage: { $round: ["$averagePercentage", 1] },
                    totalAttempts: 1
                }
            },
            // 5. Sort descending by average percentage
            { $sort: { averagePercentage: -1 } }
        ]);

        // 6. Map and inject strict ranking numbers based on sorted index
        const rankedLeaderboard = leaderboardData.map((item, index) => ({
            rank: index + 1,
            ...item
        }));

        res.json(rankedLeaderboard);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch leaderboard data' });
    }
});

// Fetch all quiz attempts for a student for a specific course
router.get('/student/course/:courseId/attempts', async (req, res) => {
    try {
        const { studentId } = req.query; // Assume studentId is passed in query for now, or use auth middleware
        if (!studentId) {
            return res.status(400).json({ error: 'Student ID is required' });
        }
        const attempts = await QuizResult.find({
            studentId,
            courseId: req.params.courseId
        })
            .populate('courseId', 'title image') // Added so CourseAttempts knows the title and image
            .sort({ date: -1 }); // Newest first

        res.json(attempts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch quiz attempts' });
    }
});

// Fetch ALL quiz attempts for a student across all courses
router.get('/student/attempts', async (req, res) => {
    try {
        const { studentId } = req.query;
        if (!studentId) {
            return res.status(400).json({ error: 'Student ID is required' });
        }
        const attempts = await QuizResult.find({ studentId })
            .populate('courseId', 'title image') // Populate course title AND image
            .sort({ date: -1 }); // Newest first

        res.json(attempts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch all quiz attempts' });
    }
});

module.exports = router;
