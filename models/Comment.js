const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    text: { type: String, required: true },
    reply: { type: String, default: '' },
    isResolved: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Comment', CommentSchema);
