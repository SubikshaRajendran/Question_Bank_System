const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://127.0.0.1:27017/question_bank', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log('Connected');
    try {
        const admin = await User.findOne({ username: 'adminbitqbs' });
        console.log('Found Admin User:', admin);

        if (admin) {
            console.log('Role:', admin.role);
            if (admin.role !== 'admin') {
                console.log('Role mismatch! Updating to admin...');
                admin.role = 'admin';
                await admin.save();
                console.log('Role updated.');
            }
        } else {
            console.log('Admin user NOT found.');
        }
    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
});
