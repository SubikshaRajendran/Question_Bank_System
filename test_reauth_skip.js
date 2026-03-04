const mongoose = require('mongoose');
const User = require('./models/User');

async function runTest() {
    await mongoose.connect('mongodb://127.0.0.1:27017/question-bank-system');
    console.log('Connected to DB');

    // 1. Ensure test user
    const email = 'test_reauth@bitsathy.ac.in';
    let user = await User.findOne({ email });
    if (!user) {
        user = new User({ email, name: 'Test User', username: 'testreauth', password: 'abc', isVerified: true });
        await user.save();
    }

    // 2. Block the user
    user.isBlocked = true;
    user.isVerified = false;
    user.needsReauthentication = true;
    await user.save();
    console.log('User Blocked and flagged for reauth.');

    // 3. Unblock the user
    user.isBlocked = false;
    await user.save();
    console.log('User Unblocked.');

    // 4. Register Init
    let res = await fetch('http://127.0.0.1:3000/api/auth/student/register-init', {
        method: 'POST', body: JSON.stringify({ email }), headers: { 'Content-Type': 'application/json' }
    });
    let data = await res.json();
    console.log('Init:', data);

    // Get OTP from DB
    user = await User.findOne({ email });
    const otp = user.otp;

    // 5. Register Verify
    res = await fetch('http://127.0.0.1:3000/api/auth/student/register-verify', {
        method: 'POST', body: JSON.stringify({ email, otp }), headers: { 'Content-Type': 'application/json' }
    });
    data = await res.json();
    console.log('Verify:', data);

    if (data.needsReauthComplete && data.user.showPasswordWarning) {
        console.log('SUCCESS: Bypassed Step 3 and set password warning flag.');

        // 6. Dismiss password warning
        res = await fetch(`http://127.0.0.1:3000/api/users/student/${data.user._id}/dismiss-password-warning`, {
            method: 'PUT'
        });
        data = await res.json();
        console.log('Dismiss Action:', data);

        user = await User.findOne({ email });
        console.log('Final DB showPasswordWarning state:', user.showPasswordWarning);
    } else {
        console.log('FAILED to bypass properly.');
    }

    await mongoose.disconnect();
}

runTest().catch(console.error);
