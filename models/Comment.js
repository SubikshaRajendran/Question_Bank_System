const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' }, // Optional for general comments
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },     // Optional for general comments
    type: { type: String, enum: ['question', 'general'], default: 'question' },
    text: { type: String, required: true },
    reply: { type: String, default: '' },
    isResolved: { type: Boolean, default: false },
    isAdminRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Comment', CommentSchema);
