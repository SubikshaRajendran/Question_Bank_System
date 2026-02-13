const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

// Use the database from .env: qb_system
const MONGO_URI = 'mongodb://localhost:27017/qb_system';

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log(`Connected to ${MONGO_URI}`);
    try {
        const adminExists = await User.findOne({ role: 'admin' });
        if (!adminExists) {
            console.log('Creating Admin in qb_system...');
            const hashedPassword = await bcrypt.hash('bitqb', 10);
            const admin = new User({
                name: 'Admin',
                username: 'adminbitqbs',
                email: 'admin@bitqb.com',
                password: hashedPassword,
                role: 'admin'
            });
            await admin.save();
            console.log('Default Admin Account Created Successfully in qb_system');
        } else {
            console.log('Admin already exists in qb_system:', adminExists.username);
            // Optional: reset password if it exists but login failed?
            // The user said "Invalid Admin Username", so it likely doesn't exist.
            // If it does exist, we might want to update the password to be sure.
            // But let's assume it doesn't exist based on the error.
        }
    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
});
