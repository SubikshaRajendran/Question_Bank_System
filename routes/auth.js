const express = require('express');
const router = express.Router();
const User = require('../models/User');

const bcrypt = require('bcryptjs');

// Admin Login
router.post('/admin/login', async (req, res) => {
    let { username, password } = req.body;
    console.log('Admin Login Attempt:', { username, password }); // Log input

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password required' });
    }

    username = username.trim();
    password = password.trim();
    console.log('Trimmed:', { username, password });

    try {
        const user = await User.findOne({ username, role: 'admin' });
        console.log('DB User Found:', user ? { id: user._id, username: user.username, role: user.role } : 'Not Found');

        if (!user) {
            // Debug: check if user exists without role check
            const userNoRole = await User.findOne({ username });
            console.log('User without role check:', userNoRole ? { id: userNoRole._id, role: userNoRole.role } : 'Not Found');
            return res.status(401).json({ success: false, message: 'Invalid Admin Username' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password Match:', isMatch);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid Password' });
        }

        res.json({ success: true, role: 'admin', user: { username: user.username, role: 'admin' } });
    } catch (err) {
        console.error("Admin Login Error", err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// Verify Admin Password
router.post('/admin/verify-password', async (req, res) => {
    let { username, password } = req.body;
    try {
        const user = await User.findOne({ username, role: 'admin' });
        if (!user) return res.status(404).json({ success: false, message: "Admin not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            res.json({ success: true });
        } else {
            res.status(401).json({ success: false, message: "Incorrect password" });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Update Admin Profile
router.put('/admin/update-profile', async (req, res) => {
    let { currentUsername, newUsername, newPassword } = req.body;

    try {
        const user = await User.findOne({ username: currentUsername, role: 'admin' });
        if (!user) return res.status(404).json({ success: false, message: "Admin not found" });

        if (newUsername && newUsername !== currentUsername) {
            const exists = await User.findOne({ username: newUsername });
            if (exists) return res.status(400).json({ success: false, message: "Username already taken" });
            user.username = newUsername;
        }

        if (newPassword) {
            user.password = await bcrypt.hash(newPassword, 10);
        }

        await user.save();
        res.json({ success: true, username: user.username });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Student Login
router.post('/student/login', async (req, res) => {
    let { email, password, username } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    email = email.trim().toLowerCase();

    if (email === 'adminbit@gmail.com') {
        return res.status(403).json({ success: false, message: 'Admin cannot login as student' });
    }

    // Domain Validation
    if (!email.endsWith('@bitsathy.ac.in')) {
        return res.status(403).json({ success: false, message: 'Only @bitsathy.ac.in emails are allowed' });
    }

    try {
        let user = await User.findOne({ email });

        if (!user) {
            // New Student (Auto-Register)
            // Enforce Default Password Policy: First 4 chars of email
            const defaultPass = email.substring(0, 4);

            if (password !== defaultPass) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid Login Credentials'
                });
            }

            // Create new user with HASHED password
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUsername = username ? username.trim() : email.split('@')[0];

            user = new User({
                name: newUsername,
                username: newUsername,
                email,
                password: hashedPassword, // Storing hash
                registeredCourses: [],
                registeredCourses: [],
                lastLogin: new Date(),
                isOnline: true
            });
            await user.save();

        } else {
            // Existing Student
            // Verify Password (Hash)
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Invalid Credentials' });
            }

            // Update lastLogin
            // Update lastLogin and isOnline
            user.lastLogin = new Date();
            user.isOnline = true;
            if (!user.username) {
                user.username = username ? username.trim() : user.email.split('@')[0];
            }
            await user.save();
        }

        // Return success with user data (excluding password ideally, but avoiding breaking changes to frontend expectations of 'user' object)
        const userObj = user.toObject();
        delete userObj.password;

        res.json({ success: true, role: 'student', user: userObj });

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

    // Domain Validation
    if (!email.endsWith('@bitsathy.ac.in')) {
        return res.status(400).json({ error: 'Only @bitsathy.ac.in emails are allowed' });
    }

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

// Logout (Set Offline)
router.post('/student/logout', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ error: 'User ID required' });

        const user = await User.findById(userId);
        if (user) {
            user.isOnline = false;
            user.lastLogin = new Date(); // Update last active time
            await user.save();
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
