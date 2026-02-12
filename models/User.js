const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, unique: true, sparse: true }, // Added username
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    lastLogin: { type: Date }, // Added lastLogin
    completedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    registeredCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    flaggedQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    readQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }] // Track individual question progress
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
