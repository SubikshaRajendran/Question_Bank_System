const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://127.0.0.1:27017/question_bank', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log('Connected');
    try {
        const adminExists = await User.findOne({ role: 'admin' });
        if (!adminExists) {
            console.log('Creating Admin...');
            const hashedPassword = await bcrypt.hash('bitqb', 10);
            const admin = new User({
                name: 'Admin',
                username: 'adminbitqbs',
                email: 'admin@bitqb.com',
                password: hashedPassword,
                role: 'admin'
            });
            await admin.save();
            console.log('Default Admin Account Created Successfully');
        } else {
            console.log('Admin already exists:', adminExists.username);
        }
    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
});
