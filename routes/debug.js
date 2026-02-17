const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Debug Email Route
router.post('/email', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = process.env.MAIL_USER;
    const pass = process.env.MAIL_PASS;
    const service = process.env.MAIL_SERVICE || 'gmail';

    const debugInfo = {
        userConfigured: !!user,
        passConfigured: !!pass,
        service: service,
        targetEmail: email
    };

    if (!user || !pass) {
        return res.status(500).json({
            success: false,
            message: 'Mail credentials missing in environment variables',
            debug: debugInfo
        });
    }

    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: user,
                pass: pass
            },
            tls: {
                rejectUnauthorized: false
            },
            connectionTimeout: 10000,
            greetingTimeout: 5000,
            socketTimeout: 10000,
            family: 4, // Force IPv4
            debug: true, // Enable debug logs
            logger: true // Log to console
        });

        const mailOptions = {
            from: user,
            to: email,
            subject: 'Question Bank System - Debug Email',
            text: 'This is a test email to verify SMTP configuration.',
        };

        const info = await transporter.sendMail(mailOptions);

        res.json({
            success: true,
            message: 'Email sent successfully',
            info: info,
            debug: debugInfo
        });

    } catch (error) {
        console.error('Debug Email Error:', error);
        res.status(500).json({
            success: false,
            message: error.message,
            error: error,
            debug: debugInfo
        });
    }
});

module.exports = router;
