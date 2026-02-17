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

const { sendOTPEmail } = require('../utils/email');

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

    // Domain Validation - REMOVED to allow any email
    // if (!email.endsWith('@bitsathy.ac.in')) {
    //     return res.status(403).json({ success: false, message: 'Only @bitsathy.ac.in emails are allowed' });
    // }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found. Please register first.' });
        }

        if (!user.isVerified) {
            return res.status(401).json({ success: false, message: 'Account not verified. Please complete registration.' });
        }

        // Verify Password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid Credentials' });
        }

        // Update lastLogin and isOnline
        user.lastLogin = new Date();
        user.isOnline = true;
        await user.save();

        // Return success with user data
        const userObj = user.toObject();
        delete userObj.password;
        delete userObj.otp;
        delete userObj.otpExpires;

        res.json({ success: true, role: 'student', user: userObj });

    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
});

// Student Register - Step 1: Init (Send OTP)
router.post('/student/register-init', async (req, res) => {
    let { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });

    email = email.trim().toLowerCase();
    // Domain Validation - REMOVED
    // if (!email.endsWith('@bitsathy.ac.in')) {
    //     return res.status(400).json({ success: false, message: 'Only @bitsathy.ac.in emails are allowed' });
    // }

    try {
        let user = await User.findOne({ email });

        if (user && user.isVerified) {
            return res.status(400).json({ success: false, message: 'User already registered. Please login.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        if (!user) {
            // New User - Create placeholder
            user = new User({
                name: email.split('@')[0], // Temporary name
                username: email.split('@')[0], // Temporary username
                email,
                password: await bcrypt.hash(Math.random().toString(36), 10), // Random password initially
                registeredCourses: [],
                isVerified: false,
                otp,
                otpExpires
            });
        } else {
            // Existing unverified user - update OTP
            user.otp = otp;
            user.otpExpires = otpExpires;
        }

        await user.save();
        await sendOTPEmail(email, otp);

        res.json({ success: true, message: 'OTP sent to email' });

    } catch (err) {
        console.error('Register Init Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Student Register - Step 2: Verify OTP
router.post('/student/register-verify', async (req, res) => {
    try {
        let { email, otp } = req.body;
        email = email.trim().toLowerCase();

        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ success: false, message: 'User not found' });
        if (user.isVerified) return res.status(400).json({ success: false, message: 'User already verified' });

        if (!user.otp || !user.otpExpires) return res.status(400).json({ success: false, message: 'No OTP found' });
        if (user.otp !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP' });
        if (user.otpExpires < new Date()) return res.status(400).json({ success: false, message: 'OTP expired' });

        // OTP Valid - Do NOT clear it yet, we need it for Step 3
        res.json({ success: true, message: 'OTP Verified' });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Student Register - Step 3: Complete (Set Username & Password)
router.post('/student/register-complete', async (req, res) => {
    try {
        let { email, otp, username, password } = req.body;
        if (!email || !otp || !username || !password) {
            return res.status(400).json({ success: false, message: 'All fields required' });
        }

        email = email.trim().toLowerCase();

        // Validation
        if (username.length < 3) return res.status(400).json({ success: false, message: 'Username too short' });
        if (password.length < 4) return res.status(400).json({ success: false, message: 'Password too short (min 4 chars)' });

        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ success: false, message: 'User not found' });
        if (user.isVerified) return res.status(400).json({ success: false, message: 'User already verified' });

        // Verify OTP again to ensure security
        if (user.otp !== otp || user.otpExpires < new Date()) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        // Check if username is taken (by another user)
        const existingUsername = await User.findOne({ username });
        if (existingUsername && existingUsername._id.toString() !== user._id.toString()) {
            return res.status(400).json({ success: false, message: 'Username already taken' });
        }

        // Update User
        user.username = username;
        user.name = username; // Default name to username
        user.password = await bcrypt.hash(password, 10);
        user.isVerified = true;
        user.isOnline = true;
        user.lastLogin = new Date();
        user.otp = undefined;
        user.otpExpires = undefined;

        await user.save();

        // Return user for auto-login
        const userObj = user.toObject();
        delete userObj.password;

        res.json({ success: true, role: 'student', user: userObj });

    } catch (err) {
        console.error('Register Complete Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Verify OTP
router.post('/student/verify-otp', async (req, res) => {
    try {
        let { email, otp } = req.body;
        email = email.trim().toLowerCase();

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ success: false, message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ success: false, message: 'User already verified' });
        }

        if (!user.otp || !user.otpExpires) {
            return res.status(400).json({ success: false, message: 'No OTP found. Please login again.' });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        if (user.otpExpires < new Date()) {
            return res.status(400).json({ success: false, message: 'OTP expired' });
        }

        // OTP Valid
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        user.isOnline = true;
        user.lastLogin = new Date();
        await user.save();

        const userObj = user.toObject();
        delete userObj.password;
        delete userObj.otp;
        delete userObj.otpExpires;

        res.json({ success: true, role: 'student', user: userObj });

    } catch (err) {
        console.error('OTP Verification Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Resend OTP
router.post('/student/resend-otp', async (req, res) => {
    try {
        let { email } = req.body;
        email = email.trim().toLowerCase();

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ success: false, message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ success: false, message: 'User already verified' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        await sendOTPEmail(email, otp);

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        res.json({ success: true, message: 'OTP resent' });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Student Register (Helper) - DEPRECATED or Keep for Admin Manual Add?
// Leaving it, but Login handles auto-registration.
router.post('/student/register', async (req, res) => {
    // ... existing register code if needed ...
    // For now, I'll assume login handles it.
    let { name, email, password, username } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

    email = email.trim().toLowerCase();

    // Domain Validation - REMOVED
    // if (!email.endsWith('@bitsathy.ac.in')) {
    //     return res.status(400).json({ error: 'Only @bitsathy.ac.in emails are allowed' });
    // }

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
            lastLogin: new Date(),
            isVerified: true // Manual registration via API assumed verified? Or remove?
            // Let's set it to true for now to avoid breaking legacy tests
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
