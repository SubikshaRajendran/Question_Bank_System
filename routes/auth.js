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
    let { email, password } = req.body;

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
            // Ideally we should password check, but for demo simplistic auth:
            user = new User({
                name: email.split('@')[0],
                email,
                password: password, // Store verify later if needed
                registeredCourses: []
            });
            await user.save();
        } else {
            // If user exists, we should check password consistency
            // But preserving "permissive" demo behavior for now, just ensure course array
            if (!user.registeredCourses) {
                user.registeredCourses = [];
                await user.save();
            }
        }

        res.json({ success: true, role: 'student', user });

    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
});

// Student Register (Helper)
router.post('/student/register', async (req, res) => {
    let { name, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

    email = email.trim().toLowerCase();

    try {
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ error: 'User already exists' });

        const newUser = new User({ name, email, password, registeredCourses: [] });
        await newUser.save();
        res.json({ success: true, user: newUser });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
