const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    completedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    registeredCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    flaggedQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    readQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }] // Track individual question progress
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
