const mongoose = require('mongoose');
const Comment = require('../models/Comment');
const Course = require('../models/Course');

mongoose.connect('mongodb://localhost:27017/qb_system', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log('Connected to MongoDB');

    try {
        // 1. Get all valid Course IDs
        const courses = await Course.find({}, '_id');
        const courseIds = courses.map(c => c._id);

        console.log(`Found ${courseIds.length} existing courses.`);

        // 2. Find and Delete Comments where courseId is NOT in courseIds
        const result = await Comment.deleteMany({
            courseId: { $nin: courseIds }
        });

        console.log(`Deleted ${result.deletedCount} orphaned comments.`);
    } catch (err) {
        console.error('Error during cleanup:', err);
    } finally {
        mongoose.connection.close();
        process.exit();
    }
}).catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
});
