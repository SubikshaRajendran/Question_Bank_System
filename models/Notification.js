const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['reply', 'new_question'], required: true },
    message: { type: String, required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' }, // Relevant for new_question
    commentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }, // Relevant for reply
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' }, // specific question created
    isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
