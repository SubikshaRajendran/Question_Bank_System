const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    department: {
        type: String,
        enum: ['CS Cluster', 'Core', 'General/Common'],
        required: true
    },
    tags: [{ type: String }],
    image: { type: String }, // URL or path to image
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }]
}, { timestamps: true });

module.exports = mongoose.model('Course', CourseSchema);
