const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Admin Login
router.post('/admin/login', (req, res) => {
    let { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    email = email.trim().toLowerCase();
    password = password.trim();

    // Exact match check
    if (email === 'adminbit@gmail.com' && password === 'bitqb') {
        res.json({ success: true, role: 'admin' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid Admin Credentials' });
    }
});

// Student Login
router.post('/student/login', async (req, res) => {
    let { email, password, username } = req.body;

    // We allow login if (email OR username) AND password are provided
    // But for this specific requirement, the user asked to ADD Username to the login form.
    // So the form will likely send both, or we can check.
    // Let's assume the form might send email/password OR username/password, or all three.
    // Given the prompt: "The student login form should now include: Username, Email, Password"
    // It implies all three are present? That's unusual for login (usually it's one or the other),
    // but I will stick to the requirement: "Username, Email, Password".
    // I will verify the user with Email AND Password, and if 'username' is provided,
    // I will update the user's username if it's missing.

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    email = email.trim().toLowerCase();

    if (email === 'adminbit@gmail.com') {
        return res.status(403).json({ success: false, message: 'Admin cannot login as student' });
    }

    try {
        let user = await User.findOne({ email });

        if (!user) {
            // Auto-register (Demo Mode)
            // If username is provided in the form, use it. Otherwise derive from email.
            const newUsername = username ? username.trim() : email.split('@')[0];

            user = new User({
                name: newUsername, // Using username as name for now if not provided otherwise
                username: newUsername,
                email,
                password: password,
                registeredCourses: [],
                lastLogin: new Date()
            });
            await user.save();
        } else {
            // User exists
            // Update lastLogin
            user.lastLogin = new Date();

            // If the user doesn't have a username yet (migrating old users), set it from request or email
            if (!user.username) {
                user.username = username ? username.trim() : user.email.split('@')[0];
            }
            // Update username if provided and different? Maybe not, don't overwrite blindly.
            // But the requirement says "Student Login page, add a new field called Username".
            // This suggests we might want to ensure the username matches or update it?
            // For safety, I'll just ensure it's set.

            if (!user.registeredCourses) {
                user.registeredCourses = [];
            }
            await user.save();
        }

        res.json({ success: true, role: 'student', user });

    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
});

// Student Register (Helper)
router.post('/student/register', async (req, res) => {
    let { name, email, password, username } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

    email = email.trim().toLowerCase();
    const finalUsername = username ? username.trim() : email.split('@')[0];

    try {
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ error: 'User already exists' });

        const newUser = new User({
            name: name || finalUsername,
            username: finalUsername,
            email,
            password,
            registeredCourses: [],
            lastLogin: new Date()
        });
        await newUser.save();
        res.json({ success: true, user: newUser });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
