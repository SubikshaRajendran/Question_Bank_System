const mongoose = require('mongoose');

const quizQuestionSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    question: {
        type: String,
        required: true
    },
    optionA: {
        type: String,
        required: true
    },
    optionB: {
        type: String,
        required: true
    },
    optionC: {
        type: String,
        required: true
    },
    optionD: {
        type: String,
        required: true
    },
    correctAnswer: {
        type: String,
        enum: ['A', 'B', 'C', 'D'],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('QuizQuestion', quizQuestionSchema);
