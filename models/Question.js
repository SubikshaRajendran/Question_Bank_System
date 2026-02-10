const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    text: { type: String, required: true }
});

module.exports = mongoose.model('Question', QuestionSchema);
