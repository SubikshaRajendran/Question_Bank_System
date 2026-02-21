const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, unique: true, sparse: true }, // Added username
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    fullName: { type: String }, // For Student Profile
    department: { type: String },
    rollNumber: { type: String },
    phoneNumber: { type: String },
    profilePicture: { type: String }, // URL to uploaded image
    password: { type: String, required: true },
    lastLogin: { type: Date }, // Added lastLogin
    isOnline: { type: Boolean, default: false }, // Track online status
    completedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    registeredCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    flaggedQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    readQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }], // Track individual question progress
    isVerified: { type: Boolean, default: false }, // OTP Verification status
    otp: { type: String },
    otpExpires: { type: Date },
    resetPasswordOtp: { type: String },
    resetPasswordOtpExpires: { type: Date },
    isBlocked: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
