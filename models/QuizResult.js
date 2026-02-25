const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    questionIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QuizQuestion'
    }],
    score: {
        type: Number,
        required: true
    },
    totalQuestions: {
        type: Number,
        required: true
    },
    percentage: {
        type: Number,
        required: true
    },
    attemptNumber: {
        type: Number,
        required: true,
        default: 1
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('QuizResult', quizResultSchema);
