const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const MONGO_URI = 'mongodb://localhost:27017/qb_system';

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log('Connected');
    try {
        const username = 'adminbitqbs';
        const password = 'bitqb';

        const user = await User.findOne({ username, role: 'admin' });
        if (!user) {
            console.log('User not found');
        } else {
            console.log('User found:', user.username);
            const isMatch = await bcrypt.compare(password, user.password);
            console.log('Password Match:', isMatch);
        }
    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
});
